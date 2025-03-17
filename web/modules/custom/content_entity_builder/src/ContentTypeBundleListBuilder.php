<?php

namespace Drupal\content_entity_builder;

use Drupal\Core\Config\Entity\ConfigEntityListBuilder;
use Drupal\Core\Url;
use Drupal\Core\Entity\EntityInterface;

/**
 * Defines a class to build a listing of blocktabs entities.
 *
 * @see \Drupal\blocktabs\Entity\BlockTabs
 */
class ContentTypeBundleListBuilder extends ConfigEntityListBuilder {

  /**
   * {@inheritdoc}
   */
  public function buildHeader() {
    $header['title'] = t('Name');
    return $header + parent::buildHeader();
  }

  /**
   * {@inheritdoc}
   */
  public function buildRow(EntityInterface $entity) {
    $row['title'] = [
      'data' => $entity->label(),
    ];

    return $row + parent::buildRow($entity);
  }

  /**
   * {@inheritdoc}
   */
  public function getDefaultOperations(EntityInterface $entity) {
	$operations =[];  
    $operations = parent::getDefaultOperations($entity);
	$entity_type = $entity->id();
    if (isset($operations['edit'])) {
      $operations['edit']['url'] = $entity->toUrl('edit-form');
    }
	
    return $operations;
  }

  /**
   * {@inheritdoc}
   */
  public function render() {
    $build = parent::render();
    $build['table']['#empty'] = $this->t('No content entity bundles available.');
    return $build;
  }

}
