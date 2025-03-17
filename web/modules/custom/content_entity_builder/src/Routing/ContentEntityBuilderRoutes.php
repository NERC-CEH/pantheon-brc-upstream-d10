<?php

namespace Drupal\content_entity_builder\Routing;

use Drupal\content_entity_builder\Entity\ContentType;
use Symfony\Component\Routing\Route;
use Symfony\Component\Routing\RouteCollection;

/**
 * Defines dynamic routes.
 */
class ContentEntityBuilderRoutes {

  /**
   * {@inheritdoc}
   */
  public function routes() {
    $route_collection = new RouteCollection();

    foreach (ContentType::loadMultiple() as $content_type) {
      $content_type_id = $content_type->id();
      $content_type_label = $content_type->label();
      $mode = $content_type->getMode() ?? "basic";
	  	  

      $paths = $content_type->getEntityPaths();
      $path_view = !empty($paths['view']) ? $paths['view'] : "/$content_type_id/{" . $content_type_id . "}";
      $path_add = !empty($paths['add']) ? $paths['add'] : "/$content_type_id/add";
      $path_edit = !empty($paths['edit']) ? $paths['edit'] : "/$content_type_id/{" . $content_type_id . "}/edit";
      $path_delete = !empty($paths['delete']) ? $paths['delete'] : "/$content_type_id/{" . $content_type_id . "}/delete";

      // Add view route.
      $route = new Route(
        // Path to attach this route to:
        // '/' . $content_type_id. '/{' . $content_type_id . '}'.
        $path_view,
        // Route defaults:
        [
          '_entity_view' => "$content_type_id",
          '_title' => $content_type_label,
        ],
        // Route requirements:
        [
          '_permission' => "access $content_type_id content entity",
        ]
      );
      // Add the route under the name 'example.content'.
      $route_collection->add('entity.' . $content_type_id . '.canonical', $route);

      if($mode === "basic"){
		  // Add add route.
        $route = new Route(
	      // '/' . $content_type_id. '/add'.
    	  $path_add,
    	  [
    	    '_entity_form' => $content_type_id . '.add',
    	    '_title' => 'Add ' . $content_type_label,
    	  ],
		  [
            '_permission'  => "create $content_type_id content entity",
          ]
        );
		$route_collection->add('entity.' . $content_type_id . '.add_form', $route);
	  }else{

		  // Add add route.
        $route = new Route(
	      // '/' . $content_type_id. '/add'.
    	  $path_add,
    	  [
    	    '_controller' => '\Drupal\content_entity_builder\Controller\ContentEntityBuilderController::addPage',
    	    '_title_callback' => '\Drupal\content_entity_builder\Controller\ContentEntityBuilderController::addPageTitle',
			'content_type' => $content_type_id,
    	  ],
		  [
            '_permission'  => "create $content_type_id content entity",
          ]
        );
		$route_collection->add('entity.' . $content_type_id . '.add_page', $route);	
		
        $route = new Route(
	      // '/' . $content_type_id. '/add'.
    	  $path_add . "/{entity_bundle}",
    	  [
    	    '_controller' => '\Drupal\content_entity_builder\Controller\ContentEntityBuilderController::addEntityPage',
    	    '_title_callback' => '\Drupal\content_entity_builder\Controller\ContentEntityBuilderController::addEntityPageTitle',
			'content_type' => $content_type_id,
    	  ],
		  [
            '_permission'  => "create $content_type_id content entity",
          ]
        );
		$route_collection->add('entity.' . $content_type_id . '.add', $route);			
		
	  }

      // Add edit route.
      $route = new Route(
        // '/' . $content_type_id. '/{' . $content_type_id . '}/edit'.
        $path_edit,
        [
          '_entity_form' => $content_type_id . '.edit',
          '_title' => 'Edit ' . $content_type_label,
        ],
        [
          //'_permission'  => "edit any $content_type_id content entity",
		  '_entity_access' => "$content_type_id.update",
        ]
      );
      $route_collection->add('entity.' . $content_type_id . '.edit_form', $route);

      // Add delete route.
      $route = new Route(
        // '/' . $content_type_id. '/{' . $content_type_id . '}/delete'.
        $path_delete,
        [
          '_entity_form' => $content_type_id . '.delete',
          '_title' => 'Delete ' . $content_type_label,
        ],
        [
          //'_permission'  => "delete any $content_type_id content entity",
		  '_entity_access' => "$content_type_id.delete",
        ]
      );
      $route_collection->add('entity.' . $content_type_id . '.delete_form', $route);

      $route = new Route(
        '/admin/structure/content-types/manage/' . $content_type_id . '/list',
        [
          '_entity_list' => $content_type_id,
          '_title' => $content_type_label . ' list',
        ],
        [
          '_permission'  => 'administer content entity types',
        ]
      );
      $route_collection->add('entity.' . $content_type_id . '.collection', $route);

      $route = new Route(
        '/admin/structure/content-types/manage/' . $content_type_id,
        [
          '_controller' => '\Drupal\content_entity_builder\Controller\ContentEntityBuilderController::editContentType',
          '_title' => 'Admin ' . $content_type_label,
          'content_type' => $content_type_id,
        ],
        [
          '_permission' => 'administer content entity types',
        ]
      );
      $route_collection->add('entity.' . $content_type_id . '.admin_form', $route);
	  
	  
      $route_bundles = new Route(
        '/admin/structure/content-types/manage/' . $content_type_id . '/bundles',
        [
          '_controller' => '\Drupal\Core\Entity\Controller\EntityListController::listing',
          '_title' => $content_type_label . ' bundles',
          'entity_type' => "{$content_type_id}_type",
        ],
        [
          '_permission' => 'administer content entity types',
        ]
      );

      $route_bundle_add = new Route(
        '/admin/structure/content-types/manage/' . $content_type_id . '/bundles/add',
        [
          '_entity_form' => "{$content_type_id}_type" . '.add',
          '_title' => 'Add ' . $content_type_label ." bundle",
        ],
        [
          '_permission' => 'administer content entity types',
        ]
      );

      $route_bundle_edit = new Route(
        '/admin/structure/content-types/manage/' . $content_type_id . "/bundles/{{$content_type_id}_type}/edit",
        [
          '_entity_form' => "{$content_type_id}_type" . '.edit',
          '_title' => 'Edit ' . $content_type_label ." bundle",
        ],
        [
          '_permission' => 'administer content entity types',
        ]
      );

      $route_bundle_delete = new Route(
        '/admin/structure/content-types/manage/' . $content_type_id . "/bundles/{{$content_type_id}_type}/delete",
        [
          '_entity_form' => "{$content_type_id}_type" . '.delete',
          '_title' => 'Delete ' . $content_type_label ." bundle",
        ],
        [
          '_permission' => 'administer content entity types',
        ]
      );	  
	  
	  if($mode === "basic_plus" || $mode === "advanced" || $mode === "full"){
        $route_collection->add("entity.{$content_type_id}_type.collection",$route_bundles);
		$route_collection->add("entity.{$content_type_id}_type.add_form",$route_bundle_add);
        $route_collection->add("entity.{$content_type_id}_type.edit_form",$route_bundle_edit);
        $route_collection->add("entity.{$content_type_id}_type.delete_form",$route_bundle_delete);		
      }
    }
    return $route_collection;
  }

}
