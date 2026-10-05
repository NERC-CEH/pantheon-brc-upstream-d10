<?php

namespace Drupal\gutenberg\Controller;

use Drupal\Core\Cache\CacheableJsonResponse;
use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Render\RendererInterface;
use Drupal\file\Entity\File;
use Drupal\Core\Image\ImageFactory;
use Drupal\Core\File\FileSystemInterface;
use Drupal\gutenberg\MediaSelectionProcessor\MediaSelectionProcessorManagerInterface;
use Drupal\gutenberg\Service\FileEntityNotFoundException;
use Drupal\gutenberg\Service\MediaEntityNotFoundException;
use Drupal\gutenberg\Service\MediaService;
use Drupal\gutenberg\Service\MediaTypeNotFoundException;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Drupal\editor\Entity\Editor;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

/**
 * Returns responses for our image routes.
 */
class MediaController extends ControllerBase {

  /**
   * The media service.
   *
   * @var \Drupal\gutenberg\Service\MediaService
   */
  protected $mediaService;

  /**
   * The media selection processor manager.
   *
   * @var \Drupal\gutenberg\MediaSelectionProcessor\MediaSelectionProcessorManagerInterface
   */
  protected $mediaSelectionProcessorManager;

  /**
   * Drupal\Core\Render\RendererInterface instance.
   *
   * @var \Drupal\Core\Render\RendererInterface
   */
  protected $renderer;

  /**
   * Drupal\Core\Image\ImageFactory instance.
   *
   * @var \Drupal\Core\Image\ImageFactory
   */
  protected $imageFactory;

  /**
   * Drupal\Core\File\FileSystemInterface instance.
   *
   * @var \Drupal\Core\File\FileSystemInterface
   */
  protected $fileSystem;

  /**
   * MediaController constructor.
   *
   * @param \Drupal\gutenberg\Service\MediaService $media_service
   *   The media service.
   * @param \Drupal\gutenberg\MediaSelectionProcessor\MediaSelectionProcessorManagerInterface $media_selection_processor_manager
   *   The media selection processor manager.
   * @param \Drupal\Core\Render\RendererInterface $renderer
   *   The renderer.
   * @param \Drupal\Core\Image\ImageFactory $image_factory
   *   The image factory.
   * @param \Drupal\Core\File\FileSystemInterface $file_system
   *   The image factory.
   */
  public function __construct(
    MediaService $media_service,
    MediaSelectionProcessorManagerInterface $media_selection_processor_manager,
    RendererInterface $renderer,
    ImageFactory $image_factory,
    FileSystemInterface $file_system,
  ) {
    $this->mediaService = $media_service;
    $this->mediaSelectionProcessorManager = $media_selection_processor_manager;
    $this->renderer = $renderer;
    $this->imageFactory = $image_factory;
    $this->fileSystem = $file_system;
  }

  /**
   * {@inheritDoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('gutenberg.media_service'),
      $container->get('gutenberg.media_selection_processor_manager'),
      $container->get('renderer'),
      $container->get('image.factory'),
      $container->get('file_system')
    );
  }

  /**
   * Render Drupal's media library dialog.
   *
   * @param \Symfony\Component\HttpFoundation\Request $request
   *   Current request.
   *
   * @return \Symfony\Component\HttpFoundation\JsonResponse
   *   The JSON response.
   *
   * @throws \Symfony\Component\HttpKernel\Exception\NotFoundHttpException
   */
  public function dialog(Request $request) {
    try {
      return new JsonResponse([
        'html' => $this->mediaService->renderDialog(
          explode(',', $request->query->get('types', '')),
          !empty($request->query->get('bundles', '')) ? explode(',', $request->query->get('bundles', '')) : NULL
        ),
      ]);
    }
    catch (MediaTypeNotFoundException $exception) {
      throw new NotFoundHttpException($exception->getMessage(), $exception);
    }
  }

  /**
   * Load media data.
   *
   * @param \Symfony\Component\HttpFoundation\Request $request
   *   Current request.
   * @param string $media
   *   Media data (numeric or stringified JSON for media data processing).
   *
   * @return \Symfony\Component\HttpFoundation\JsonResponse
   *   The JSON response.
   *
   * @throws \Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException
   * @throws \Drupal\Component\Plugin\Exception\PluginNotFoundException
   */
  public function loadMedia(Request $request, string $media) {
    $media_entities = $this->mediaSelectionProcessorManager->processData($media);

    try {
      if (!$media_entities) {
        throw new MediaEntityNotFoundException();
      }

      $media_entity = reset($media_entities);
      $response = new CacheableJsonResponse($this->mediaService->loadMediaData($media_entity));
      $response->addCacheableDependency($media_entity);
      return $response;
    }
    catch (MediaEntityNotFoundException $exception) {
      throw new NotFoundHttpException($exception->getMessage(), $exception);
    }
  }

  /**
   * Render provided media entity.
   *
   * @param string $media
   *   Media data (numeric or stringified JSON for media data processing).
   *
   * @return \Symfony\Component\HttpFoundation\JsonResponse
   *   The JSON response.
   */
  public function render(string $media) {
    $media_entities = $this->mediaSelectionProcessorManager->processData($media);

    try {
      if (!$media_entities) {
        throw new MediaEntityNotFoundException();
      }

      $media_entity = reset($media_entities);

      return new JsonResponse([
        'view_modes' => $this->mediaService->getRenderedMediaEntity($media_entity),
        'media_entity' => [
          'id' => $media_entity->id(),
          'type' => $media_entity->bundle(),
        ],
      ]);
    }
    catch (MediaEntityNotFoundException $exception) {
      throw new NotFoundHttpException($exception->getMessage(), $exception);
    }
  }

  /**
   * Upload files, save as file and media entity if possible.
   *
   * @param \Symfony\Component\HttpFoundation\Request $request
   *   Current request.
   * @param \Drupal\editor\Entity\Editor|null $editor
   *   Editor entity instance.
   *
   * @return \Symfony\Component\HttpFoundation\JsonResponse
   *   The JSON response.
   *
   * @throws \Exception
   */
  public function upload(Request $request, ?Editor $editor = NULL) {
    $files = $request->files->get('files', []);
    $uploaded_file = $files['fid'] ?? NULL;

    if (!$uploaded_file instanceof UploadedFile) {
      throw new UnprocessableEntityHttpException('The uploaded file is invalid.');
    }

    try {
      return new JsonResponse($this->mediaService->processMediaEntityUpload('fid', $uploaded_file, $editor));
    }
    catch (\Exception $exception) {
      // DefaultExceptionSubscriber::on4xx only normalizes 4xx client errors.
      return new JsonResponse(
        $this->getErrorResponse($exception->getMessage()),
        JsonResponse::HTTP_INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Get data of the media entity required for Gutenberg editor.
   *
   * @param \Symfony\Component\HttpFoundation\Request $request
   *   Current request.
   * @param \Drupal\file\Entity\File|null $file
   *   Loaded found file entity instance.
   *
   * @return \Symfony\Component\HttpFoundation\JsonResponse
   *   The JSON response.
   *
   * @throws \Exception
   */
  public function load(Request $request, ?File $file = NULL) {
    if (!$file) {
      throw new NotFoundHttpException('File entity not found.');
    }

    try {
      $response = new CacheableJsonResponse($this->mediaService->loadFileData($file));
      $response->addCacheableDependency($file);
      return $response;
    }
    catch (FileEntityNotFoundException $exception) {
      throw new NotFoundHttpException($exception->getMessage(), $exception);
    }
  }

  /**
   * Create a new media from Gutenberg image editing.
   *
   * @param \Symfony\Component\HttpFoundation\Request $request
   *   Current request.
   * @param \Drupal\file\Entity\File|null $file
   *   Loaded found file entity instance.
   *
   * @return \Symfony\Component\HttpFoundation\JsonResponse
   *   The JSON response.
   *
   * @throws \Exception
   */
  public function edit(Request $request, ?File $file = NULL) {
    if (!$file) {
      throw new NotFoundHttpException('File entity not found.');
    }

    $payload = $request->request->all();
    if (!isset($payload['modifiers']) || !isset($payload['modifiers'][0])) {
      throw new BadRequestHttpException('Invalid payload.');
    }
    $image = $this->imageFactory->get($file->getFileUri());
    $modified = FALSE;
    foreach ($payload['modifiers'] as $modifier) {
      if (isset($modifier['type']) && $modifier['type'] === 'rotate' && isset($modifier['args']['angle'])) {
        $angle = $modifier['args']['angle'];
        if (!$image->rotate($angle)) {
          throw new UnprocessableEntityHttpException('Image rotate failed.');
        }
        $modified = TRUE;
        continue;
      }
      if (isset($modifier['type']) && $modifier['type'] === 'flip' && isset($modifier['args']['flip'])) {
        // The payload is form encoded, so the booleans are 'true'/'false'.
        $horizontal = filter_var($modifier['args']['flip']['horizontal'] ?? FALSE, FILTER_VALIDATE_BOOLEAN);
        $vertical = filter_var($modifier['args']['flip']['vertical'] ?? FALSE, FILTER_VALIDATE_BOOLEAN);
        if ($horizontal || $vertical) {
          if (!$image->apply('gutenberg_flip', ['horizontal' => $horizontal, 'vertical' => $vertical])) {
            throw new UnprocessableEntityHttpException('Image flip failed.');
          }
          $modified = TRUE;
        }
        continue;
      }
      // Crop & zoom are really crop, so this should be relevant for the rest
      // of cases.
      if (!isset($modifier['args']['left']) || !isset($modifier['args']['top']) || !isset($modifier['args']['width']) || !isset($modifier['args']['height'])) {
        throw new BadRequestHttpException('Invalid payload.');
      }
      $x = $modifier['args']['left'];
      $y = $modifier['args']['top'];
      $width = $modifier['args']['width'];
      $height = $modifier['args']['height'];

      $original_width = $image->getWidth();
      $original_height = $image->getHeight();

      $new_x = (int) (($original_width * $x) / 100);
      $new_y = (int) (($original_height * $y) / 100);
      $new_width = (int) (($original_width * $width) / 100);
      $new_height = (int) (($original_height * $height) / 100);

      if (!$image->crop($new_x, $new_y, $new_width, $new_height)) {
        throw new UnprocessableEntityHttpException('Image crop failed.');
      }
      $modified = TRUE;
    }

    if (!$modified) {
      throw new BadRequestHttpException('Invalid payload modifiers. No modifications were made to the image.');
    }
    $dir = $this->fileSystem->dirname($file->getFileUri());
    $new_uri = $this->fileSystem->createFilename($file->getFilename(), $dir);
    $new_filename = preg_replace('/(\.\w+$)/i', '-edited$1', $file->getFilename());

    if (!$image->save($new_uri)) {
      throw new UnprocessableEntityHttpException('Unable to save image.');
    }
    $new_file = File::create([
      'uid' => $this->currentUser()->id(),
      'filename' => $new_filename,
      'uri' => $new_uri,
    ]);
    $new_file->save();
    try {
      return new JsonResponse($this->mediaService->loadFileData($new_file), 201);
    }
    catch (FileEntityNotFoundException $exception) {
      throw new NotFoundHttpException($exception->getMessage(), $exception);
    }
  }

  /**
   * List media entities for the inserter media tab.
   *
   * @param \Symfony\Component\HttpFoundation\Request $request
   *   Current request.
   *
   * @return \Symfony\Component\HttpFoundation\JsonResponse
   *   The JSON response.
   */
  public function listMedia(Request $request): JsonResponse {
    $media_type = $request->query->get('media_type', '');
    $search = $request->query->get('search', '');
    $per_page = (int) $request->query->get('per_page', 10);
    $orderby = $request->query->get('orderby', 'date');

    return new JsonResponse(
      $this->mediaService->listMedia($media_type, $search, $per_page, $orderby)
    );
  }

  /**
   * Searches for files.
   *
   * @param \Symfony\Component\HttpFoundation\Request $request
   *   The request.
   * @param string $type
   *   The MIME type search string.
   * @param string $search
   *   The filename search string.
   *
   * @return \Symfony\Component\HttpFoundation\JsonResponse
   *   The JSON response.
   *
   * @throws \Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException
   * @throws \Drupal\Component\Plugin\Exception\PluginNotFoundException
   */
  public function search(Request $request, string $type = '', string $search = '') {
    return new JsonResponse(
      $this->mediaService->search($request, $type, $search)
    );
  }

  /**
   * Updates file data.
   *
   * @param \Symfony\Component\HttpFoundation\Request $request
   *   Current request.
   * @param string|int $fid
   *   File id.
   *
   * @return \Symfony\Component\HttpFoundation\JsonResponse
   *   The JSON response.
   *
   * @throws \Symfony\Component\HttpKernel\Exception\HttpException
   */
  public function updateData(Request $request, $fid) {
    $data = json_decode($request->getContent(), TRUE);

    if (json_last_error() !== JSON_ERROR_NONE) {
      throw new BadRequestHttpException('Request data could not be parsed.');
    }

    try {
      $this->mediaService->updateMediaData($fid, $data);
    }
    catch (\Throwable $exception) {
      return new JsonResponse(['message' => 'Data could not be updated'], JsonResponse::HTTP_INTERNAL_SERVER_ERROR);
    }

    return new JsonResponse(['status' => 'ok']);
  }

  /**
   * Get data for autocomplete.
   *
   * @param \Symfony\Component\HttpFoundation\Request $request
   *   Current request.
   *
   * @return \Symfony\Component\HttpFoundation\JsonResponse
   *   The JSON response.
   */
  public function autocomplete(Request $request) {
    return new JsonResponse(
      $this->mediaService->getMediaEntityAutoCompleteData($request->get('search', ''))
    );
  }

  /**
   * Returns the error response including status messages.
   *
   * @param string $error
   *   The original error.
   *
   * @return array
   *   JSON response to return to the client.
   */
  protected function getErrorResponse($error) {
    $messages = $this->messenger()->deleteAll();
    if ($messages) {
      // Display the status messages along with the original error.
      // @todo (HACKY) Leverage AjaxRenderer + "_wrapper_format=drupal_ajax" to handle this instead.
      $message_entries = [];
      foreach (['error', 'warning', 'status'] as $status) {
        if (isset($messages[$status])) {
          /* @noinspection SlowArrayOperationsInLoopInspection */
          $message_entries = array_merge($message_entries, $messages[$status]);
        }
      }

      if ($message_entries) {
        $render = [
          '#type' => 'inline_template',
          '#template' => '<div class="gutenberg-error--initial">{{ error }}</div><div class="gutenberg-error--other-messages">{{ messages }}</div>',
          '#context' => [
            'error' => $error,
            'messages' => [
              '#theme' => 'item_list',
              '#list_type' => 'ul',
              '#items' => $message_entries,
            ],
          ],
        ];

        $output = $this->renderer->renderRoot($render);
        return [
          'error' => $output,
          // Render as Raw HTML.
          'rawHTML' => TRUE,
        ];
      }
    }

    return [
      'error' => $error,
    ];
  }

}
