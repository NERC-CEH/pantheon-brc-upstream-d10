<?php

namespace Drupal\gutenberg_notes\Controller;

use Drupal\comment\CommentInterface;
use Drupal\comment\Entity\Comment;
use Drupal\Core\Controller\ControllerBase;
use Drupal\gutenberg\UserAvatarResolver;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * Handles CRUD operations for Gutenberg Notes (block-level comments).
 */
class NotesController extends ControllerBase {

  /**
   * Constructs a NotesController.
   */
  public function __construct(
    protected UserAvatarResolver $avatarResolver,
  ) {}

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('gutenberg.user_avatar_resolver'),
    );
  }

  /**
   * Lists all notes for a given entity.
   */
  public function listNotes(Request $request, string $entity_type, int $entity_id): JsonResponse {
    // Query all notes for this entity, bypassing access checks since
    // unpublished = unresolved in the Notes context and must be visible.
    $cids = $this->entityTypeManager()->getStorage('comment')->getQuery()
      ->condition('entity_type', $entity_type)
      ->condition('entity_id', $entity_id)
      ->condition('comment_type', 'gutenberg_note')
      ->condition('field_name', 'gutenberg_notes')
      ->sort('cid', 'ASC')
      ->accessCheck(FALSE)
      ->execute();

    $comments = $this->entityTypeManager()->getStorage('comment')->loadMultiple($cids);

    $result = [];
    foreach ($comments as $comment) {
      $result[] = $this->formatComment($comment);
    }

    return new JsonResponse($result);
  }

  /**
   * Creates a new note.
   */
  public function createNote(Request $request, string $entity_type, int $entity_id): JsonResponse {
    $data = json_decode($request->getContent(), TRUE);

    if (empty($data)) {
      return new JsonResponse(['message' => 'Invalid request body.'], 400);
    }

    $content = $data['content'] ?? '';
    $status = $data['status'] ?? 'hold';
    $parent_id = $data['parent'] ?? 0;
    $meta = $data['meta'] ?? [];
    $block_type = $data['block_type'] ?? '';

    // Map WP status to Drupal comment status.
    $drupal_status = ($status === 'approved')
      ? CommentInterface::PUBLISHED
      : CommentInterface::NOT_PUBLISHED;

    // Build subject: resolution meta takes priority, then block type for root
    // notes, so comments are identifiable in the Drupal admin UI.
    $subject = $this->buildSubjectFromMeta($meta);
    if (empty($subject) && !$parent_id && $block_type) {
      $subject = 'Note on ' . $block_type;
    }

    $comment = Comment::create([
      'comment_type' => 'gutenberg_note',
      'entity_type' => $entity_type,
      'entity_id' => $entity_id,
      'field_name' => 'gutenberg_notes',
      'uid' => $this->currentUser()->id(),
      'pid' => $parent_id ?: NULL,
      'status' => $drupal_status,
      'subject' => $subject,
      'comment_body' => [
        'value' => $content,
        'format' => 'plain_text',
      ],
    ]);

    $comment->save();

    return new JsonResponse($this->formatComment($comment), 201);
  }

  /**
   * Updates an existing note.
   */
  public function updateNote(Request $request, int $comment_id): JsonResponse {
    $comment = $this->loadAndValidateComment($comment_id);
    $data = json_decode($request->getContent(), TRUE);

    if (empty($data)) {
      return new JsonResponse(['message' => 'Invalid request body.'], 400);
    }

    if (isset($data['content'])) {
      $comment->set('comment_body', [
        'value' => $data['content'],
        'format' => 'plain_text',
      ]);
    }

    if (isset($data['status'])) {
      $drupal_status = ($data['status'] === 'approved')
        ? CommentInterface::PUBLISHED
        : CommentInterface::NOT_PUBLISHED;
      $comment->setPublished($drupal_status === CommentInterface::PUBLISHED);
    }

    if (isset($data['meta'])) {
      $comment->setSubject($this->buildSubjectFromMeta($data['meta']));
    }

    $comment->save();

    return new JsonResponse($this->formatComment($comment));
  }

  /**
   * Deletes a note and all its children.
   */
  public function deleteNote(Request $request, int $comment_id): JsonResponse {
    $comment = $this->loadAndValidateComment($comment_id);
    $formatted = $this->formatComment($comment);

    // Delete all child comments first (replies).
    $children = $this->entityTypeManager()->getStorage('comment')->loadByProperties([
      'pid' => $comment_id,
      'comment_type' => 'gutenberg_note',
    ]);

    foreach ($children as $child) {
      $child->delete();
    }

    $comment->delete();

    return new JsonResponse([
      'deleted' => TRUE,
      'previous' => $formatted,
    ]);
  }

  /**
   * Loads a comment and validates it is a gutenberg_note.
   */
  private function loadAndValidateComment(int $comment_id): CommentInterface {
    $comment = $this->entityTypeManager()->getStorage('comment')->load($comment_id);

    if (!$comment || $comment->bundle() !== 'gutenberg_note') {
      throw new NotFoundHttpException('Note not found.');
    }

    return $comment;
  }

  /**
   * Formats a Drupal Comment entity as a WP REST API comment object.
   */
  private function formatComment(CommentInterface $comment): array {
    $owner = $comment->getOwner();
    $avatar_url = $this->avatarResolver->getAvatarUrl($owner);
    $parent = $comment->getParentComment();

    return [
      'id' => (int) $comment->id(),
      'post' => (int) $comment->getCommentedEntityId(),
      'parent' => $parent ? (int) $parent->id() : 0,
      'author' => (int) $comment->getOwnerId(),
      'author_name' => $owner->getDisplayName(),
      'author_avatar_urls' => [
        '24' => $avatar_url,
        '48' => $avatar_url,
        '96' => $avatar_url,
      ],
      'date' => gmdate('Y-m-d\TH:i:s', $comment->getCreatedTime()),
      'date_gmt' => gmdate('Y-m-d\TH:i:s', $comment->getCreatedTime()),
      'content' => [
        'rendered' => $comment->get('comment_body')->value ?? '',
        'raw' => $comment->get('comment_body')->value ?? '',
      ],
      'status' => $comment->isPublished() ? 'approved' : 'hold',
      'type' => 'note',
      'meta' => $this->getNoteMeta($comment),
    ];
  }

  /**
   * Extracts note meta from the comment subject field.
   */
  private function getNoteMeta(CommentInterface $comment): array {
    $subject = $comment->getSubject();
    $meta = [];

    if ($subject === '[resolved]') {
      $meta['_wp_note_status'] = 'resolved';
    }
    elseif ($subject === '[reopen]') {
      $meta['_wp_note_status'] = 'reopen';
    }

    return $meta;
  }

  /**
   * Builds a subject string from WP meta for storage.
   */
  private function buildSubjectFromMeta(array $meta): string {
    if (!empty($meta['_wp_note_status'])) {
      return '[' . $meta['_wp_note_status'] . ']';
    }
    return '';
  }

}
