<?php

namespace Drupal\content_entity_builder\Export;

use Drupal\Core\Archiver\ArchiveTar;
use Drupal\content_entity_builder\Entity\ContentType;
use Drupal\Component\Render\FormattableMarkup;

/**
 * Class ContentEntityBuilderDownloadController.
 *
 * @package Drupal\content_entity_builder\Controller
 */
class ContentEntityBuilderExportHelper{

  /**
   * The config.
   */
  protected $config;

  /**
   * @param $config
   */
  public function __construct($config) {
    $this->config = $config;

  }
  
  /**
   * generate info yml.
   */
  public function generateArchiveTarFile() {
    $name = isset($this->config['name']) ? $this->config['name'] : '';
	if(empty($name)){
      return;		
	}
    //file_unmanaged_delete(\Drupal::service('file_system')->getTempDirectory() . '/' . $name .'.tar.gz');
	
	//Delete it if it already exist.
	\Drupal::service('file_system')
      ->delete(\Drupal::service('file_system')->getTempDirectory() . '/' . $name .'.tar.gz');

    $archiver = new ArchiveTar(\Drupal::service('file_system')->getTempDirectory() . '/' . $name .'.tar.gz', 'gz');
	$content_types = isset($this->config['content_types']) ? $this->config['content_types'] : [];
	
	$archiver->addString("$name.info.yml", $this->generateInfoYml());
    $archiver->addString("$name.module", $this->generateModulePhp($content_types));
    $archiver->addString("$name.install", $this->generateInstallPhp());
    $archiver->addString("$name.permissions.yml", $this->generatePermissionsYml());
    $archiver->addString("$name.links.action.yml", $this->generateLinksActionYml());
    $archiver->addString("$name.links.task.yml", $this->generateLinksTaskYml());
    $archiver->addString("$name.links.menu.yml", $this->generateLinksMenuYml());
    $archiver->addString("$name.routing.yml", $this->generateRoutingYml());
    $archiver->addString("config/schema/$name.schema.yml", $this->generateSchemaYml());	
	
	
	foreach($content_types as $content_type_id){
      $content_type = \Drupal::entityTypeManager()->getStorage('content_type')->load($content_type_id);
	  $mode = $content_type->getMode();
      $entity_name =  $content_type->id();
	  $EntityName = str_replace(' ', '', ucwords(str_replace('_', ' ', $entity_name)));	
      if($mode ==="basic"){  
	    $archiver->addString("src/Entity/$EntityName.php", $this->generateEntityPhp($content_type, $entity_name, $EntityName));
	  }elseif($mode ==="basic_plus"){
		$archiver->addString("src/Entity/$EntityName.php", $this->generatePlusEntityPhp($content_type, $entity_name, $EntityName));  
	  }elseif($mode ==="advanced"){
		$archiver->addString("src/Entity/$EntityName.php", $this->generateAdvancedEntityPhp($content_type, $entity_name, $EntityName));  
	  }elseif($mode ==="full"){
		$archiver->addString("src/Entity/$EntityName.php", $this->generateFullEntityPhp($content_type, $entity_name, $EntityName));  
	  }
	  $archiver->addString("src/" . $EntityName . "Interface.php", $this->generateInterfacePhp($content_type, $entity_name, $EntityName));
      $archiver->addString("src/" . $EntityName . "ListBuilder.php", $this->generateListBuilderPhp($content_type, $entity_name, $EntityName));
      $archiver->addString("src/Form/" . $EntityName . "Form.php", $this->generateFormPhp($content_type, $entity_name, $EntityName));
      $archiver->addString("src/Form/" . $EntityName . "DeleteForm.php", $this->generateDeleteFormPhp($content_type, $entity_name, $EntityName));
      if($mode ==="basic" || $mode ==="basic_plus"){ 
        $archiver->addString("src/" . $EntityName . "AccessControlHandler.php", $this->generateAccessControlHandlerPhp($content_type, $entity_name, $EntityName));
      }elseif($mode ==="advanced" || $mode ==="full"){
        $archiver->addString("src/" . $EntityName . "AccessControlHandler.php", $this->generateAdvancedAccessControlHandlerPhp($content_type, $entity_name, $EntityName));		  
	  }
	  $archiver->addString("src/" . $EntityName . "StorageSchema.php", $this->generateStorageSchemaPhp($content_type, $entity_name, $EntityName));	  
	  $archiver->addString("templates/" . $entity_name . ".html.twig", $this->generateEntityTwig($content_type, $entity_name, $EntityName));
	  if($mode ==="basic_plus" || $mode ==="advanced" || $mode ==="full"){  
	    $archiver->addString("src/Entity/" . $EntityName ."Type.php", $this->generateEntityTypePhp($content_type, $entity_name, $EntityName));
	    $archiver->addString("src/" . $EntityName . "TypeInterface.php", $this->generateTypeInterfacePhp($content_type, $entity_name, $EntityName));
        $archiver->addString("src/" . $EntityName . "TypeListBuilder.php", $this->generateTypeListBuilderPhp($content_type, $entity_name, $EntityName));

        $archiver->addString("src/Form/" . $EntityName . "TypeForm.php", $this->generateTypeFormPhp($content_type, $entity_name, $EntityName));
        $archiver->addString("src/Form/" . $EntityName . "TypeDeleteForm.php", $this->generateTypeDeleteFormPhp($content_type, $entity_name, $EntityName));
		$archiver->addString("src/Controller/" . $EntityName . "Controller.php", $this->generateEntityControllerPhp($content_type, $entity_name, $EntityName));
	  }
	}
	 
	
  }
  
  /**
   * generate info yml.
   */
  public function generateInfoYml() {
  $template = <<<Eof
name: @name
type: module
description: @description
core_version_requirement: ^9.1 || ^10
Eof;
    $ret = strtr($template, array(
      "@name" => isset($this->config['label']) ? $this->config['label'] : '',
      "@description" => isset($this->config['description']) ? $this->config['description'] : '',
    ));
	
    return $ret;
  }

  /**
   * generate module php.
   */
  public function generateModulePhp($content_types) {
  $template = <<<Eof
<?php

/**
 * @file
 * @description
 */

use Drupal\Core\Render\Element; 

Eof;
    $ret = strtr($template, array(
      "@description" => isset($this->config['description']) ? $this->config['description'] : '',
    ));
	
  $template_prefix = <<<Eof
/**
 * Implements hook_theme().
 */
function @module_name_theme() {
  return [

Eof;

    $ret .= strtr($template_prefix, [
      "@module_name" => $this->config['name'],
    ]);
	

  foreach($content_types as $content_type_id){
  
    $template_hook_theme = <<<Eof
    '@entity_name' => [
      'render element' => 'elements',
    ],
Eof;
    $ret .= strtr($template_hook_theme, [
      "@entity_name" => $content_type_id,
    ]);	
  }


$ret .= <<<Eof

  ];
}
Eof;

	
	
  foreach($content_types as $content_type_id){
  
    $template_preprocess = <<<Eof

/**
 * Prepares variables for @entity_name templates.
 *
 * Default template: @entity_name.html.twig.
 *
 * @param array \$variables
 *   An associative array containing:
 *   - elements: An associative array containing the @entity_name information and any
 *     fields attached to the @entity_name. Properties used:
 *     - #@entity_name: A \Drupal\@module_name\Entity\@entity_name object. The @entity_name account of the
 *       profile being viewed.
 *   - attributes: HTML attributes for the containing element.
 */
function template_preprocess_@entity_name(&\$variables) {
  \$variables['@entity_name'] = \$variables['elements']['#@entity_name'];
  // Helpful \$content variable for templates.
  foreach (Element::children(\$variables['elements']) as \$key) {
    \$variables['content'][\$key] = \$variables['elements'][\$key];
  }
}

Eof;
    $ret .= strtr($template_preprocess, [
      "@entity_name" =>$content_type_id,
	  "@module_name" => $this->config['name'],
    ]);	
  }
 	
	
	
    return $ret;
  }

  /**
   * generate install php.
   */
  public function generateInstallPhp() {
  $template = <<<Eof
<?php

/**
 * @file
 * Install, update and uninstall functions for the @module_name module.
 */
 
/**
 * Implements hook_schema().
 */
function @module_name_install() {
  \$exist = \Drupal::moduleHandler()->moduleExists('content_entity_builder');
  if(empty(\$exist)) {
    return;
  }
  \$content_types = [@content_types];
  foreach(\$content_types as \$content_type_id) {
    //delete the content type config directly if it exist.
    \$content_type = \Drupal::entityTypeManager()->getStorage('content_type')->load(\$content_type_id);
    if(!empty(\$content_type)) {
      \Drupal::entityTypeManager()->getStorage('content_type')->delete([\$content_type_id => \$content_type]);
    }	  
  }
  drupal_flush_all_caches();
}

Eof;
    $content_types_str = "";
    $content_types = isset($this->config['content_types']) ? $this->config['content_types'] : [];
    foreach ($content_types as $content_type) {
        $content_types_str .= "'" . $content_type . "', ";
    }
    $str_len = strlen($content_types_str);
    if($str_len > 0){
      $content_types_str = substr($content_types_str, 0, ($str_len-2)); 
    }
    $ret = strtr($template, array(
      "@module_name" => $this->config['name'],
      "@content_types" => $content_types_str,
    ));
	
    return $ret;
  }
  
  /**
   * generate entity php content.
   */
  public function generateEntityPhp(ContentType $content_type, $entity_name, $EntityName) {
  $template = <<<Eof
<?php

namespace Drupal\@module_name\Entity;

use Drupal\Core\Entity\EntityStorageInterface;
use Drupal\Core\Field\BaseFieldDefinition;
use Drupal\Core\Entity\ContentEntityBase;
use Drupal\Core\Entity\EntityTypeInterface;
use Drupal\@module_name\@EntityNameInterface;

/**
 * Defines the @entity_name entity.
 *
 * @ingroup @entity_name
 *
 * @ContentEntityType(
 *   id = "@entity_name",
 *   label = @Translation("@entity_label"),
 *   handlers = {
 *     "view_builder" = "Drupal\\Core\\Entity\\EntityViewBuilder",
 *     "list_builder" = "Drupal\\@module_name\\@EntityNameListBuilder",
 *     "views_data" = "Drupal\\views\\EntityViewsData",
 *     "storage_schema" = "Drupal\\@module_name\\@EntityNameStorageSchema", 
 *     "form" = {
 *       "default" = "Drupal\\@module_name\\Form\\@EntityNameForm",
 *       "add" = "Drupal\\@module_name\\Form\\@EntityNameForm",
 *       "edit" = "Drupal\\@module_name\\Form\\@EntityNameForm",
 *       "delete" = "Drupal\\@module_name\\Form\\@EntityNameDeleteForm",
 *     },
 *     "access" = "Drupal\\@module_name\\@EntityNameAccessControlHandler", 
 *   },
 *   base_table = "@entity_name",
 *   admin_permission = "administer @entity_name entity",
 *   entity_keys = {
@entity_keys_code
 *   },
 *   links = {
 *     "canonical" = "@path_view",
 *     "edit-form" = "@path_edit",
 *     "delete-form" = "@path_edit",
 *     "collection" = "/admin/structure/@entity_names" 
 *   },
 *   field_ui_base_route = "entity.@entity_name.collection",
 * )
 */
class @EntityName extends ContentEntityBase implements @EntityNameInterface {

  /**
   * {@inheritdoc}
   */
  public static function baseFieldDefinitions(EntityTypeInterface \$entity_type) {
    \$fields = parent::baseFieldDefinitions(\$entity_type);
@fields_code
    return \$fields;
  }

}
Eof;

    $entity_keys_code = "";
    $fields_code = "";

	//get entity_keys_code
    $keys = array_filter($content_type->getEntityKeys());
    if (empty($keys)) {
      $keys = [
        'id' => 'id',
        'uuid' => 'uuid',
      ];
    }
	$entity_keys_code .=  ' *     "id" = "' . $keys['id'] . '",';
    if(isset($keys['uuid'])){
	  $entity_keys_code .=  '
 *     "uuid" = "' . $keys['uuid'] . '",';		
	}
    if(isset($keys['label'])){
	  $entity_keys_code .=  '
 *     "label" = "' . $keys['label'] . '",';		
	}

    foreach ($content_type->getBaseFields() as $base_field) {
      $fields_code .= $base_field->exportCode();
    }
	
    //$content_type = \Drupal::entityTypeManager()->getStorage('content_type')->load($content_type_id);
    $content_type_id = $content_type->id();
    $paths = $content_type->getEntityPaths();
    $path_view = !empty($paths['view']) ? $paths['view'] : "/$content_type_id/{" . $content_type_id . "}";
    //$path_add = !empty($paths['add']) ? $paths['add'] : "/$content_type_id/add";
    $path_edit = !empty($paths['edit']) ? $paths['edit'] : "/$content_type_id/{" . $content_type_id . "}/edit";
    $path_delete = !empty($paths['delete']) ? $paths['delete'] : "/$content_type_id/{" . $content_type_id . "}/delete";
	  
    $ret = strtr($template, array(
      "@module_name" => $this->config['name'],
      "@entity_name" => $entity_name,
      "@entity_label" => $content_type->getLabel(),	  
	  "@EntityName" => $EntityName,
      "@entity_keys_code" => $entity_keys_code,
      "@fields_code" => $fields_code,
      "@path_view" => $path_view,
      //"@path_add" => $path_add,
      "@path_edit" => $path_edit,
      "@path_delete" => $path_delete,		  
    ));
	
    return $ret;
  }  
  
  /**
   * generate plus mode entity php content.
   */
  public function generatePlusEntityPhp(ContentType $content_type, $entity_name, $EntityName) {
  $template = <<<Eof
<?php

namespace Drupal\@module_name\Entity;

use Drupal\Core\Entity\EntityStorageInterface;
use Drupal\Core\Field\BaseFieldDefinition;
use Drupal\Core\Entity\ContentEntityBase;
use Drupal\Core\Entity\EntityTypeInterface;
use Drupal\@module_name\@EntityNameInterface;

/**
 * Defines the @entity_name entity.
 *
 * @ingroup @entity_name
 *
 * @ContentEntityType(
 *   id = "@entity_name",
 *   label = @Translation("@entity_label"),
 *   handlers = {
 *     "view_builder" = "Drupal\\Core\\Entity\\EntityViewBuilder",
 *     "list_builder" = "Drupal\\@module_name\\@EntityNameListBuilder",
 *     "views_data" = "Drupal\\views\\EntityViewsData",
 *     "storage_schema" = "Drupal\\@module_name\\@EntityNameStorageSchema", 
 *     "form" = {
 *       "default" = "Drupal\\@module_name\\Form\\@EntityNameForm",
 *       "add" = "Drupal\\@module_name\\Form\\@EntityNameForm",
 *       "edit" = "Drupal\\@module_name\\Form\\@EntityNameForm",
 *       "delete" = "Drupal\\@module_name\\Form\\@EntityNameDeleteForm",
 *     },
 *     "access" = "Drupal\\@module_name\\@EntityNameAccessControlHandler", 
 *   },
 *   base_table = "@entity_name",
 *   admin_permission = "administer @entity_name entity",
 *   entity_keys = {
@entity_keys_code
 *   },
 *   links = {
 *     "canonical" = "@path_view",
 *     "edit-form" = "@path_edit",
 *     "delete-form" = "@path_edit",
 *     "collection" = "/admin/structure/@entity_names" 
 *   },
 *   bundle_entity_type = "@entity_name_type",
 *   field_ui_base_route = "entity.@entity_name_type.edit_form", 
 * )
 */
class @EntityName extends ContentEntityBase implements @EntityNameInterface {

  /**
   * {@inheritdoc}
   */
  public static function baseFieldDefinitions(EntityTypeInterface \$entity_type) {
    \$fields = parent::baseFieldDefinitions(\$entity_type);
@fields_code
    return \$fields;
  }

}
Eof;

    $entity_keys_code = "";
    $fields_code = "";

	//get entity_keys_code
    $keys = array_filter($content_type->getEntityKeys());
    if (empty($keys)) {
      $keys = [
        'id' => 'id',
        'uuid' => 'uuid',
      ];
    }
	$entity_keys_code .=  ' *     "id" = "' . $keys['id'] . '",';
    if(isset($keys['uuid'])){
	  $entity_keys_code .=  '
 *     "uuid" = "' . $keys['uuid'] . '",';		
	}
    if(isset($keys['label'])){
	  $entity_keys_code .=  '
 *     "label" = "' . $keys['label'] . '",';		
	}
    if(isset($keys['bundle'])){
	  $entity_keys_code .=  '
 *     "bundle" = "' . $keys['bundle'] . '",';		
	}	

    foreach ($content_type->getBaseFields() as $base_field) {
      $fields_code .= $base_field->exportCode();
    }
	
    //$content_type = \Drupal::entityTypeManager()->getStorage('content_type')->load($content_type_id);
    $content_type_id = $content_type->id();
    $paths = $content_type->getEntityPaths();
    $path_view = !empty($paths['view']) ? $paths['view'] : "/$content_type_id/{" . $content_type_id . "}";
    //$path_add = !empty($paths['add']) ? $paths['add'] : "/$content_type_id/add";
    $path_edit = !empty($paths['edit']) ? $paths['edit'] : "/$content_type_id/{" . $content_type_id . "}/edit";
    $path_delete = !empty($paths['delete']) ? $paths['delete'] : "/$content_type_id/{" . $content_type_id . "}/delete";
	  
    $ret = strtr($template, array(
      "@module_name" => $this->config['name'],
      "@entity_name" => $entity_name,
      "@entity_label" => $content_type->getLabel(),	  
	  "@EntityName" => $EntityName,
      "@entity_keys_code" => $entity_keys_code,
      "@fields_code" => $fields_code,
      "@path_view" => $path_view,
      //"@path_add" => $path_add,
      "@path_edit" => $path_edit,
      "@path_delete" => $path_delete,		  
    ));
	
    return $ret;
  }  


  /**
   * generate advanced mode entity php content.
   */
  public function generateAdvancedEntityPhp(ContentType $content_type, $entity_name, $EntityName) {
  $template = <<<Eof
<?php

namespace Drupal\@module_name\Entity;

use Drupal\Core\Entity\ContentEntityBase;
use Drupal\Core\Entity\EntityStorageInterface;
use Drupal\Core\Entity\EntityTypeInterface;
use Drupal\Core\Entity\EntityChangedInterface;
use Drupal\Core\Entity\EntityPublishedInterface;
use Drupal\user\EntityOwnerInterface;
use Drupal\Core\Entity\EntityChangedTrait;
use Drupal\Core\Entity\EntityPublishedTrait;
use Drupal\Core\Field\BaseFieldDefinition;
use Drupal\user\EntityOwnerTrait;
use Drupal\@module_name\@EntityNameInterface;

/**
 * Defines the @entity_name entity.
 *
 * @ingroup @entity_name
 *
 * @ContentEntityType(
 *   id = "@entity_name",
 *   label = @Translation("@entity_label"),
 *   handlers = {
 *     "view_builder" = "Drupal\\Core\\Entity\\EntityViewBuilder",
 *     "list_builder" = "Drupal\\@module_name\\@EntityNameListBuilder",
 *     "views_data" = "Drupal\\views\\EntityViewsData",
 *     "storage_schema" = "Drupal\\@module_name\\@EntityNameStorageSchema", 
 *     "form" = {
 *       "default" = "Drupal\\@module_name\\Form\\@EntityNameForm",
 *       "add" = "Drupal\\@module_name\\Form\\@EntityNameForm",
 *       "edit" = "Drupal\\@module_name\\Form\\@EntityNameForm",
 *       "delete" = "Drupal\\@module_name\\Form\\@EntityNameDeleteForm",
 *     },
 *     "access" = "Drupal\\@module_name\\@EntityNameAccessControlHandler", 
 *   },
 *   base_table = "@entity_name",
 *   data_table = "@entity_name_field_data", 
 *   admin_permission = "administer @entity_name entity",
 *   translatable = TRUE, 
 *   entity_keys = {
@entity_keys_code
 *   },
 *   links = {
 *     "canonical" = "@path_view",
 *     "edit-form" = "@path_edit",
 *     "delete-form" = "@path_edit",
 *     "collection" = "/admin/structure/@entity_names" 
 *   },
 *   bundle_entity_type = "@entity_name_type",
 *   field_ui_base_route = "entity.@entity_name_type.edit_form", 
 * )
 */
class @EntityName extends ContentEntityBase implements EntityChangedInterface, EntityOwnerInterface, EntityPublishedInterface, @EntityNameInterface  {

  use EntityChangedTrait;
  use EntityPublishedTrait;
  use EntityOwnerTrait;

  /**
   * {@inheritdoc}
   */
  public function preSave(EntityStorageInterface \$storage) {
    parent::preSave(\$storage);

    foreach (array_keys(\$this->getTranslationLanguages()) as \$langcode) {
      \$translation = \$this->getTranslation(\$langcode);

      // If no owner has been set explicitly, make the anonymous user the owner.
      if (!\$translation->getOwner()) {
        \$translation->setOwnerId(0);
      }
    }

  }

  /**
   * {@inheritdoc}
   */
  public static function baseFieldDefinitions(EntityTypeInterface \$entity_type) {
    \$fields = parent::baseFieldDefinitions(\$entity_type);
	if(empty(\$entity_type)){
		return \$fields;
	}	
    // Add the published field.
    \$fields += static::publishedBaseFieldDefinitions(\$entity_type);
    \$fields += static::ownerBaseFieldDefinitions(\$entity_type);
	
	\$owner_key = \$entity_type->getKey('owner');
    \$fields[\$owner_key]
      ->setLabel(t('Authored by'))
      ->setDescription(t('The username of the content author.'))
      ->setRevisionable(TRUE)
      ->setDisplayOptions('view', [
        'label' => 'hidden',
        'type' => 'author',
        'weight' => 0,
      ])
      ->setDisplayOptions('form', [
        'type' => 'entity_reference_autocomplete',
        'weight' => 5,
        'settings' => [
          'match_operator' => 'CONTAINS',
          'size' => '60',
          'placeholder' => '',
        ],
      ])
      ->setDisplayConfigurable('form', TRUE);

	\$published_key = \$entity_type->getKey('published');
    \$fields[\$published_key]
      ->setDisplayOptions('form', [
        'type' => 'boolean_checkbox',
        'settings' => [
          'display_label' => TRUE,
        ],
        'weight' => 120,
      ])
      ->setDisplayConfigurable('form', TRUE);

    \$fields['changed'] = BaseFieldDefinition::create('changed')
      ->setLabel(t('Changed'))
      ->setDescription(t('The time that the content was last edited.'))
      ->setRevisionable(TRUE)
      ->setTranslatable(TRUE);
	  
@fields_code
    return \$fields;
  }

}
Eof;

    $entity_keys_code = "";
    $fields_code = "";

	//get entity_keys_code
    $keys = array_filter($content_type->getEntityKeys());
    if (empty($keys)) {
      $keys = [
        'id' => 'id',
        'uuid' => 'uuid',
      ];
    }
	$entity_keys_code .=  ' *     "id" = "' . $keys['id'] . '",';
    if(isset($keys['uuid'])){
	  $entity_keys_code .=  '
 *     "uuid" = "' . $keys['uuid'] . '",';		
	}
    if(isset($keys['label'])){
	  $entity_keys_code .=  '
 *     "label" = "' . $keys['label'] . '",';		
	}
    if(isset($keys['bundle'])){
	  $entity_keys_code .=  '
 *     "bundle" = "' . $keys['bundle'] . '",';		
	}
    if(isset($keys['langcode'])){
	  $entity_keys_code .=  '
 *     "langcode" = "' . $keys['langcode'] . '",';		
	}	
    if(isset($keys['published'])){
	  $entity_keys_code .=  '
 *     "published" = "' . $keys['published'] . '",';		
	}
    if(isset($keys['owner'])){
	  $entity_keys_code .=  '
 *     "owner" = "' . $keys['owner'] . '",';		
	}	
    foreach ($content_type->getBaseFields() as $base_field) {
      $fields_code .= $base_field->exportCode("TRUE","FALSE");
    }
	
    //$content_type = \Drupal::entityTypeManager()->getStorage('content_type')->load($content_type_id);
    $content_type_id = $content_type->id();
    $paths = $content_type->getEntityPaths();
    $path_view = !empty($paths['view']) ? $paths['view'] : "/$content_type_id/{" . $content_type_id . "}";
    //$path_add = !empty($paths['add']) ? $paths['add'] : "/$content_type_id/add";
    $path_edit = !empty($paths['edit']) ? $paths['edit'] : "/$content_type_id/{" . $content_type_id . "}/edit";
    $path_delete = !empty($paths['delete']) ? $paths['delete'] : "/$content_type_id/{" . $content_type_id . "}/delete";
	  
    $ret = strtr($template, array(
      "@module_name" => $this->config['name'],
      "@entity_name" => $entity_name,
      "@entity_label" => $content_type->getLabel(),	  
	  "@EntityName" => $EntityName,
      "@entity_keys_code" => $entity_keys_code,
      "@fields_code" => $fields_code,
      "@path_view" => $path_view,
      //"@path_add" => $path_add,
      "@path_edit" => $path_edit,
      "@path_delete" => $path_delete,		  
    ));
	
    return $ret;
  }


  /**
   * generate full mode entity php content.
   */
  public function generateFullEntityPhp(ContentType $content_type, $entity_name, $EntityName) {
  $template = <<<Eof
<?php

namespace Drupal\@module_name\Entity;

use Drupal\Core\Entity\EditorialContentEntityBase;
use Drupal\Core\Entity\EntityStorageInterface;
use Drupal\Core\Entity\EntityTypeInterface;
use Drupal\user\EntityOwnerInterface;
use Drupal\user\EntityOwnerTrait;
use Drupal\Core\Field\BaseFieldDefinition;
use Drupal\@module_name\@EntityNameInterface;

/**
 * Defines the @entity_name entity.
 *
 * @ingroup @entity_name
 *
 * @ContentEntityType(
 *   id = "@entity_name",
 *   label = @Translation("@entity_label"),
 *   handlers = {
 *     "view_builder" = "Drupal\\Core\\Entity\\EntityViewBuilder",
 *     "list_builder" = "Drupal\\@module_name\\@EntityNameListBuilder",
 *     "views_data" = "Drupal\\views\\EntityViewsData",
 *     "storage_schema" = "Drupal\\@module_name\\@EntityNameStorageSchema", 
 *     "form" = {
 *       "default" = "Drupal\\@module_name\\Form\\@EntityNameForm",
 *       "add" = "Drupal\\@module_name\\Form\\@EntityNameForm",
 *       "edit" = "Drupal\\@module_name\\Form\\@EntityNameForm",
 *       "delete" = "Drupal\\@module_name\\Form\\@EntityNameDeleteForm",
 *     },
 *     "access" = "Drupal\\@module_name\\@EntityNameAccessControlHandler", 
 *   },
 *   base_table = "@entity_name",
 *   data_table = "@entity_name_field_data",
 *   revision_table = "@entity_name__revision",
 *   revision_data_table = "@entity_name_field_revision",
 *   show_revision_ui = TRUE, 
 *   admin_permission = "administer @entity_name entity",
 *   translatable = TRUE, 
 *   entity_keys = {
@entity_keys_code
 *   },
 *   revision_metadata_keys = {
 *     "revision_user" = "revision_uid",
 *     "revision_created" = "revision_timestamp",
 *     "revision_log_message" = "revision_log"
 *   }, 
 *   links = {
 *     "canonical" = "@path_view",
 *     "edit-form" = "@path_edit",
 *     "delete-form" = "@path_edit",
 *     "collection" = "/admin/structure/@entity_names" 
 *   },
 *   bundle_entity_type = "@entity_name_type",
 *   field_ui_base_route = "entity.@entity_name_type.edit_form", 
 * )
 */
class @EntityName extends EditorialContentEntityBase implements EntityOwnerInterface, @EntityNameInterface  {

  use EntityOwnerTrait;

  /**
   * {@inheritdoc}
   */
  public function preSave(EntityStorageInterface \$storage) {
    parent::preSave(\$storage);

    foreach (array_keys(\$this->getTranslationLanguages()) as \$langcode) {
      \$translation = \$this->getTranslation(\$langcode);

      // If no owner has been set explicitly, make the anonymous user the owner.
      if (!\$translation->getOwner()) {
        \$translation->setOwnerId(0);
      }
    }
	
    // If no revision author has been set explicitly, make the entity owner the
    // revision author.
    if (!\$this->getRevisionUser()) {
      \$this->setRevisionUserId(\$this->getOwnerId());
    }	

  }
  
  /**
   * {@inheritdoc}
   */
  public function preSaveRevision(EntityStorageInterface \$storage, \stdClass \$record) {
    parent::preSaveRevision(\$storage, \$record);

    if (!\$this->isNewRevision() && isset(\$this->original) && (!isset(\$record->revision_log) || \$record->revision_log === '')) {
      // If we are updating an existing block_content without adding a new
      // revision and the user did not supply a revision log, keep the existing
      // one.
      \$record->revision_log = \$this->original->getRevisionLogMessage();
    }
  }   
  

  /**
   * {@inheritdoc}
   */
  public static function baseFieldDefinitions(EntityTypeInterface \$entity_type) {
    \$fields = parent::baseFieldDefinitions(\$entity_type);
	if(empty(\$entity_type)){
		return \$fields;
	}
    \$fields += static::ownerBaseFieldDefinitions(\$entity_type);

	\$owner_key = \$entity_type->getKey('owner');	
    \$fields[\$owner_key]
      ->setLabel(t('Authored by'))
      ->setDescription(t('The username of the content author.'))
      ->setRevisionable(TRUE)
      ->setDisplayOptions('view', [
        'label' => 'hidden',
        'type' => 'author',
        'weight' => 0,
      ])
      ->setDisplayOptions('form', [
        'type' => 'entity_reference_autocomplete',
        'weight' => 5,
        'settings' => [
          'match_operator' => 'CONTAINS',
          'size' => '60',
          'placeholder' => '',
        ],
      ])
      ->setDisplayConfigurable('form', TRUE);

	\$published_key = \$entity_type->getKey('published');
    \$fields[\$published_key]
      ->setDisplayOptions('form', [
        'type' => 'boolean_checkbox',
        'settings' => [
          'display_label' => TRUE,
        ],
        'weight' => 120,
      ])
      ->setDisplayConfigurable('form', TRUE);


    \$fields['changed'] = BaseFieldDefinition::create('changed')
      ->setLabel(t('Changed'))
      ->setDescription(t('The time that the content was last edited.'))
      ->setRevisionable(TRUE)
      ->setTranslatable(TRUE);
	  
@fields_code
    return \$fields;
  }

}
Eof;

    $entity_keys_code = "";
    $fields_code = "";

	//get entity_keys_code
    $keys = array_filter($content_type->getEntityKeys());
    if (empty($keys)) {
      $keys = [
        'id' => 'id',
        'uuid' => 'uuid',
      ];
    }
	$entity_keys_code .=  ' *     "id" = "' . $keys['id'] . '",';
    if(isset($keys['uuid'])){
	  $entity_keys_code .=  '
 *     "uuid" = "' . $keys['uuid'] . '",';		
	}
    if(isset($keys['label'])){
	  $entity_keys_code .=  '
 *     "label" = "' . $keys['label'] . '",';		
	}
    if(isset($keys['bundle'])){
	  $entity_keys_code .=  '
 *     "bundle" = "' . $keys['bundle'] . '",';		
	}	
    if(isset($keys['langcode'])){
	  $entity_keys_code .=  '
 *     "langcode" = "' . $keys['langcode'] . '",';		
	}	
    if(isset($keys['published'])){
	  $entity_keys_code .=  '
 *     "published" = "' . $keys['published'] . '",';		
	}
    if(isset($keys['owner'])){
	  $entity_keys_code .=  '
 *     "owner" = "' . $keys['owner'] . '",';		
	}
    if(isset($keys['revision'])){
	  $entity_keys_code .=  '
 *     "revision" = "' . $keys['revision'] . '",';		
	}	
    foreach ($content_type->getBaseFields() as $base_field) {
      $fields_code .= $base_field->exportCode("TRUE","TRUE");
    }
	
    //$content_type = \Drupal::entityTypeManager()->getStorage('content_type')->load($content_type_id);
    $content_type_id = $content_type->id();
    $paths = $content_type->getEntityPaths();
    $path_view = !empty($paths['view']) ? $paths['view'] : "/$content_type_id/{" . $content_type_id . "}";
    //$path_add = !empty($paths['add']) ? $paths['add'] : "/$content_type_id/add";
    $path_edit = !empty($paths['edit']) ? $paths['edit'] : "/$content_type_id/{" . $content_type_id . "}/edit";
    $path_delete = !empty($paths['delete']) ? $paths['delete'] : "/$content_type_id/{" . $content_type_id . "}/delete";
	  
    $ret = strtr($template, array(
      "@module_name" => $this->config['name'],
      "@entity_name" => $entity_name,
      "@entity_label" => $content_type->getLabel(),	  
	  "@EntityName" => $EntityName,
      "@entity_keys_code" => $entity_keys_code,
      "@fields_code" => $fields_code,
      "@path_view" => $path_view,
      //"@path_add" => $path_add,
      "@path_edit" => $path_edit,
      "@path_delete" => $path_delete,		  
    ));
	
    return $ret;
  }
  
  
  /**
   * generate entity type php content.
   */
  public function generateEntityTypePhp(ContentType $content_type, $entity_name, $EntityName) {
  $template = <<<Eof
<?php

namespace Drupal\@module_name\Entity;

use Drupal\Core\Config\Entity\ConfigEntityBundleBase;
use Drupal\@module_name\@EntityNameTypeInterface;

/**
 * Defines the @entity_name type entity.
 *
 * @ConfigEntityType(
 *   id = "@entity_name_type",
 *   label = @Translation("@entity_name type"),
 *   handlers = {
 *     "form" = {
 *       "default" = "Drupal\@module_name\Form\@EntityNameTypeForm",
 *       "add" = "Drupal\@module_name\Form\@EntityNameTypeForm",
 *       "edit" = "Drupal\@module_name\Form\@EntityNameTypeForm",
 *       "delete" = "Drupal\@module_name\Form\@EntityNameTypeDeleteForm"
 *     },
 *     "route_provider" = {
 *       "html" = "Drupal\Core\Entity\Routing\AdminHtmlRouteProvider",
 *       "permissions" = "Drupal\user\Entity\EntityPermissionsRouteProviderWithCheck",
 *     },
 *     "list_builder" = "Drupal\@module_name\@EntityNameTypeListBuilder"
 *   },
 *   admin_permission = "administer @entity_names",
 *   config_prefix = "@entity_name_type",
 *   bundle_of = "@entity_name",
 *   entity_keys = {
 *     "id" = "id",
 *     "label" = "label"
 *   },
 *   links = {
 *     "delete-form" = "/admin/structure/@entity_names/manage/{@entity_name_type}/delete",
 *     "edit-form" = "/admin/structure/@entity_names/manage/{@entity_name_type}",
 *     "entity-permissions-form" = "/admin/structure/@entity_names/manage/{@entity_name_type}/permissions",
 *     "collection" = "/admin/structure/@entity_names/types",
 *   },
 *   config_export = {
 *     "id",
 *     "label",
 *     "description",
 *   }
 * )
 */
class @EntityNameType extends ConfigEntityBundleBase implements @EntityNameTypeInterface {

  /**
   * The @entity_name type ID.
   *
   * @var string
   */
  protected \$id;

  /**
   * The @entity_name type label.
   *
   * @var string
   */
  protected \$label;

  /**
   * The description of the @entity_name type.
   *
   * @var string
   */
  protected \$description;

  /**
   * {@inheritdoc}
   */
  public function getDescription() {
    return \$this->description;
  }
}
Eof;

    $entity_keys_code = "";
    $fields_code = "";

	//get entity_keys_code
    $keys = array_filter($content_type->getEntityKeys());
    if (empty($keys)) {
      $keys = [
        'id' => 'id',
        'uuid' => 'uuid',
      ];
    }
	$entity_keys_code .=  ' *     "id" = "' . $keys['id'] . '",';
    if(isset($keys['uuid'])){
	  $entity_keys_code .=  '
 *     "uuid" = "' . $keys['uuid'] . '",';		
	}
    if(isset($keys['label'])){
	  $entity_keys_code .=  '
 *     "label" = "' . $keys['label'] . '",';		
	}

    foreach ($content_type->getBaseFields() as $base_field) {
      $fields_code .= $base_field->exportCode();
    }
	
    //$content_type = \Drupal::entityTypeManager()->getStorage('content_type')->load($content_type_id);
    $content_type_id = $content_type->id();
    $paths = $content_type->getEntityPaths();
    $path_view = !empty($paths['view']) ? $paths['view'] : "/$content_type_id/{" . $content_type_id . "}";
    //$path_add = !empty($paths['add']) ? $paths['add'] : "/$content_type_id/add";
    $path_edit = !empty($paths['edit']) ? $paths['edit'] : "/$content_type_id/{" . $content_type_id . "}/edit";
    $path_delete = !empty($paths['delete']) ? $paths['delete'] : "/$content_type_id/{" . $content_type_id . "}/delete";
	  
    $ret = strtr($template, array(
      "@module_name" => $this->config['name'],
      "@entity_name" => $entity_name,
      "@entity_label" => $content_type->getLabel(),	  
	  "@EntityName" => $EntityName,
      "@entity_keys_code" => $entity_keys_code,
      "@fields_code" => $fields_code,
      "@path_view" => $path_view,
      //"@path_add" => $path_add,
      "@path_edit" => $path_edit,
      "@path_delete" => $path_delete,		  
    ));
	
    return $ret;
  }    

  /**
   * generate interface php content.
   */
  public function generateInterfacePhp(ContentType $content_type, $entity_name, $EntityName) {
  $template = <<<Eof
<?php

namespace Drupal\@module_name;

use Drupal\Core\Entity\ContentEntityInterface;

/**
 * Provides an interface for defining @entity_name entities.
 *
 * @ingroup @entity_name
 */
interface @EntityNameInterface extends ContentEntityInterface{

}

Eof;

    $ret = strtr($template, array(
      "@module_name" => $this->config['name'],
      "@entity_name" => $entity_name,
	  "@EntityName" => $EntityName,
    ));
	
    return $ret;
  }  
  
  /**
   * generate type interface php content.
   */
  public function generateTypeInterfacePhp(ContentType $content_type, $entity_name, $EntityName) {
  $template = <<<Eof
<?php

namespace Drupal\@module_name;

use Drupal\Core\Config\Entity\ConfigEntityInterface;

/**
 * Provides an interface defining a custom entity bundle.
 */
interface @EntityNameTypeInterface extends ConfigEntityInterface {

  /**
   * Returns the description of the bundle.
   *
   * @return string
   *   The description of the bundle.
   */
  public function getDescription();

}

Eof;

    $ret = strtr($template, array(
      "@module_name" => $this->config['name'],
	  "@EntityName" => $EntityName,
    ));
	
    return $ret;
  }    
  
  /**
   * generate list builder php content.
   */
  public function generateListBuilderPhp(ContentType $content_type, $entity_name, $EntityName) {
  $template = <<<Eof
<?php

namespace Drupal\@module_name;

use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Entity\EntityListBuilder;
use Drupal\Core\Link;
use Drupal\Core\Url;

/**
 * Defines a class to build a listing of @entity_name entities.
 *
 * @see \Drupal\@module_name\Entity\@EntityName
 */
class @EntityNameListBuilder extends EntityListBuilder {

  /**
   * {@inheritdoc}
   */
  public function buildHeader() {
    \$header['label'] = t('Label');
    return \$header + parent::buildHeader();
  }

  /**
   * {@inheritdoc}
   */
  public function buildRow(EntityInterface \$entity) {
    \$label = !empty(\$entity->label()) ? \$entity->label() : \$entity->id();
	\$row['label'] = new Link(\$label, Url::fromRoute("entity.@entity_name.canonical", ["@entity_name" => \$entity->id()]));
    return \$row + parent::buildRow(\$entity);
  }

  /**
   * {@inheritdoc}
   */
  public function getDefaultOperations(EntityInterface \$entity) {
    \$operations = parent::getDefaultOperations(\$entity);

    return \$operations;
  }

}


Eof;

    $ret = strtr($template, array(
      "@module_name" => $this->config['name'],
      "@entity_name" => $entity_name,
	  "@EntityName" => $EntityName,
    ));

    return $ret;
  }
  
  
  /**
   * generate type list builder php content.
   */
  public function generateTypeListBuilderPhp(ContentType $content_type, $entity_name, $EntityName) {
  $template = <<<Eof
<?php

namespace Drupal\@module_name;

use Drupal\Core\Config\Entity\ConfigEntityListBuilder;
use Drupal\Core\Url;
use Drupal\Core\Entity\EntityInterface;

/**
 * Defines a class to build a listing of @entity_name type config entities.
 *
 */
class @EntityNameTypeListBuilder extends ConfigEntityListBuilder {

  /**
   * {@inheritdoc}
   */
  public function buildHeader() {
    \$header['title'] = t('Name');
    return \$header + parent::buildHeader();
  }

  /**
   * {@inheritdoc}
   */
  public function buildRow(EntityInterface \$entity) {
    \$row['title'] = [
      'data' => \$entity->label(),
    ];

    return \$row + parent::buildRow(\$entity);
  }

  /**
   * {@inheritdoc}
   */
  public function getDefaultOperations(EntityInterface \$entity) {
	\$operations =[];  
    \$operations = parent::getDefaultOperations(\$entity);
	\$entity_type = \$entity->id();
    if (isset(\$operations['edit'])) {
      \$operations['edit']['url'] = \$entity->toUrl('edit-form');
    }
	
    return \$operations;
  }

  /**
   * {@inheritdoc}
   */
  public function render() {
    \$build = parent::render();
    \$build['table']['#empty'] = \$this->t('No @entity_name types available.');
    return \$build;
  }

}



Eof;

    $ret = strtr($template, array(
      "@module_name" => $this->config['name'],
      "@entity_name" => $entity_name,
	  "@EntityName" => $EntityName,
    ));

    return $ret;
  }  

  /**
   * generate form php content.
   */
  public function generateFormPhp(ContentType $content_type, $entity_name, $EntityName) {
  $template = <<<Eof
<?php

namespace Drupal\@module_name\Form;

use Drupal\Core\Entity\ContentEntityForm;
use Drupal\Core\Form\FormStateInterface;

/**
 * Form controller for @entity_name edit forms.
 *
 * @ingroup @module_name
 */
class @EntityNameForm extends ContentEntityForm {

  /**
   * {@inheritdoc}
   */
  public function buildForm(array \$form, FormStateInterface \$form_state) {
    \$form = parent::buildForm(\$form, \$form_state);
    \$form['actions']['#weight'] = 200;
    return \$form;
  }

  /**
   * {@inheritdoc}
   */
  protected function actions(array \$form, FormStateInterface \$form_state) {
    \$element = parent::actions(\$form, \$form_state);
    \$entity = \$this->entity;

    \$account = \Drupal::currentUser();
    \$type_id = \$entity->getEntityTypeId();
    \$element['delete']['#access'] = \$account->hasPermission('delete @entity_name entity');
    \$element['delete']['#weight'] = 100;

    return \$element;
  }

  /**
   * {@inheritdoc}
   */
  public function submit(array \$form, FormStateInterface \$form_state) {
    // Build the entity object from the submitted values.
    \$entity = parent::submit(\$form, \$form_state);
    return \$entity;
  }

  /**
   * {@inheritdoc}
   */
  public function save(array \$form, FormStateInterface \$form_state) {
    \$entity = \$this->entity;
    \$status = \$entity->save();

    switch (\$status) {
      case SAVED_NEW:
        \Drupal::messenger()->addMessage(\$this->t('Created the %label.', [
            '%label' => \$entity->label(),
          ]));

        break;

      default:
        \Drupal::messenger()->addMessage(\$this->t('Saved the %label.', [
          '%label' => \$entity->label(),
        ]));
    }
    \$form_state->setRedirect("entity.@entity_name.canonical", ["@entity_name" => \$entity->id()]);
  }

}

Eof;

    $ret = strtr($template, array(
      "@module_name" => $this->config['name'],
      "@entity_name" => $entity_name,
	  "@EntityName" => $EntityName,
    ));
	
    return $ret;
  }
  
  
  /**
   * generate type form php content.
   */
  public function generateTypeFormPhp(ContentType $content_type, $entity_name, $EntityName) {
  $template = <<<Eof
<?php

namespace Drupal\@module_name\Form;

use Drupal\Core\Entity\BundleEntityFormBase;
use Drupal\Core\Entity\EntityTypeInterface;
use Drupal\Core\Form\FormStateInterface;

/**
 * The @entity_name type entity form.
 *
 * @internal
 */
class @EntityNameTypeForm extends BundleEntityFormBase {

  /**
   * {@inheritdoc}
   */
  public function form(array \$form, FormStateInterface \$form_state) {
    \$form = parent::form(\$form, \$form_state);

    \$entity = \$this->entity;

    if (\$this->operation == 'add') {
      \$form['#title'] = \$this->t('Add custom type');
    }
    else {
      \$form['#title'] = \$this->t('Edit %label custom type', ['%label' => \$entity->label()]);
    }

    \$form['label'] = [
      '#type' => 'textfield',
      '#title' => \$this->t('Label'),
      '#maxlength' => 255,
      '#default_value' => \$entity->label(),
      '#description' => \$this->t("Provide a label for this type to help identify it in the administration pages."),
      '#required' => TRUE,
    ];
    \$form['id'] = [
      '#type' => 'machine_name',
      '#default_value' => \$entity->id(),
      '#machine_name' => [
        'exists' => '\Drupal\@module_name\Entity\@EntityNameType::load',
		//'exists' => [\$this,'exists'],
      ],
      '#maxlength' => EntityTypeInterface::BUNDLE_MAX_LENGTH,
    ];

    \$form['description'] = [
      '#type' => 'textarea',
      '#default_value' => \$entity->getDescription(),
      '#description' => \$this->t('Enter a description for this type.'),
      '#title' => \$this->t('Description'),
    ];

    \$form['actions'] = ['#type' => 'actions'];
    \$form['actions']['submit'] = [
      '#type' => 'submit',
      '#value' => \$this->t('Save'),
    ];

    return \$this->protectBundleIdElement(\$form);
  } 

  /**
   * {@inheritdoc}
   */
  public function save(array \$form, FormStateInterface \$form_state) {
    \$entity = \$this->entity;
    \$status = \$entity->save();

    \$edit_link = \$this->entity->toLink(\$this->t('Edit'), 'edit-form')->toString();
    \$logger = \$this->logger('content_entity_builder');
    if (\$status == SAVED_UPDATED) {
      \$this->messenger()->addStatus(\$this->t('Custom type %label has been updated.', ['%label' => \$entity->label()]));
      \$logger->notice('Custom type %label has been updated.', ['%label' => \$entity->label(), 'link' => \$edit_link]);
    }
    else {
      \$this->messenger()->addStatus(\$this->t('Custom type %label has been added.', ['%label' => \$entity->label()]));
      \$logger->notice('Custom type %label has been added.', ['%label' => \$entity->label(), 'link' => \$edit_link]);
    }

    \$form_state->setRedirectUrl(\$this->entity->toUrl('collection'));
  }

}

Eof;

    $ret = strtr($template, array(
      "@module_name" => $this->config['name'],
      "@entity_name" => $entity_name,
	  "@EntityName" => $EntityName,
    ));
	
    return $ret;
  }  

  /**
   * generate delete form php content.
   */
  public function generateDeleteFormPhp(ContentType $content_type, $entity_name, $EntityName) {
  $template = <<<Eof
<?php

namespace Drupal\@module_name\Form;

use Drupal\Core\Entity\ContentEntityConfirmFormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Url;

/**
 * Provides a form for deleting a @entity_name entity.
 *
 * @ingroup @module_name
 */
class @EntityNameDeleteForm extends ContentEntityConfirmFormBase {

  /**
   * {@inheritdoc}
   */
  public function getQuestion() {
    return \$this->t('Are you sure you want to delete %name?', ['%name' => \$this->entity->label()]);
  }

  /**
   * {@inheritdoc}
   *
   * If the delete command is canceled, return to the contact list.
   */
  public function getCancelUrl() {
    return new Url('entity.@entity_name.canonical',["@entity_name" => \$this->entity->id()]);
  }

  /**
   * {@inheritdoc}
   */
  public function getConfirmText() {
    return \$this->t('Delete');
  }

  /**
   * {@inheritdoc}
   *
   * Delete the entity and log the event. logger() replaces the watchdog.
   */
  public function submitForm(array &\$form, FormStateInterface \$form_state) {
    \$entity = \$this->getEntity();
    \$entity->delete();

    \$form_state->setRedirect('entity.@entity_name.collection');
  }

}

Eof;

    $ret = strtr($template, array(
      "@module_name" => $this->config['name'],
      "@entity_name" => $entity_name,
	  "@EntityName" => $EntityName,
    ));
	
    return $ret;
  }
  
  /**
   * generate type delete form php content.
   */
  public function generateTypeDeleteFormPhp(ContentType $content_type, $entity_name, $EntityName) {
  $template = <<<Eof
<?php

namespace Drupal\@module_name\Form;

use Drupal\Core\Entity\EntityDeleteForm;
use Drupal\Core\Form\FormStateInterface;

/**
 * Provides a confirmation form for deleting a custom bundle entity.
 *
 * @internal
 */
class @EntityNameTypeDeleteForm extends EntityDeleteForm {

  /**
   * {@inheritdoc}
   */
  public function buildForm(array \$form, FormStateInterface \$form_state) {

    \$content_count = \$this->entityTypeManager->getStorage("@entity_name")->getQuery()
      ->accessCheck(FALSE)
      ->condition('type', \$this->entity->id())
      ->count()
      ->execute();
    if (\$content_count) {
      \$caption = '<p>' . \$this->formatPlural(\$content_count, '%label is used by 1 custom content on your site. You can not remove this bundle until you have removed all of the %label contents.', '%label is used by @count custom contents on your site. You may not remove %label until you have removed all of the %label custom contents.', ['%label' => \$this->entity->label()]) . '</p>';
      \$form['description'] = ['#markup' => \$caption];
      return \$form;
    }
    else {
      return parent::buildForm(\$form, \$form_state);
    }
  }

}


Eof;

    $ret = strtr($template, array(
      "@module_name" => $this->config['name'],
      "@entity_name" => $entity_name,
	  "@EntityName" => $EntityName,
    ));
	
    return $ret;
  }  
  
  /**
   * generate access control handler php content.
   */
  public function generateAccessControlHandlerPhp(ContentType $content_type, $entity_name, $EntityName) {
  $template = <<<Eof
<?php

namespace Drupal\@module_name;

use Drupal\Core\Access\AccessResult;
use Drupal\Core\Entity\EntityAccessControlHandler;
use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Session\AccountInterface;

/**
 * Access controller for the @entity_name entity.
 */
class @EntityNameAccessControlHandler extends EntityAccessControlHandler {

  /**
   * {@inheritdoc}
   *
   * Link the activities to the permissions. checkAccess() is called with the
   * \$operation as defined in the routing.yml file.
   */
  protected function checkAccess(EntityInterface \$entity, \$operation, AccountInterface \$account) {
    // Check the admin_permission as defined in your @ContentEntityType
    // annotation.
    \$admin_permission = \$this->entityType->getAdminPermission();
    if (\Drupal::currentUser()->hasPermission(\$admin_permission)) {
      return AccessResult::allowed();
    }
    switch (\$operation) {
      case 'view':
        return AccessResult::allowedIfHasPermission(\$account, 'view @entity_name entity');

      case 'update':
        return AccessResult::allowedIfHasPermission(\$account, 'edit @entity_name entity');

      case 'delete':
        return AccessResult::allowedIfHasPermission(\$account, 'delete @entity_name entity');
    }
    return AccessResult::neutral();
  }

  /**
   * {@inheritdoc}
   *
   * Separate from the checkAccess because the entity does not yet exist. It
   * will be created during the 'add' process.
   */
  protected function checkCreateAccess(AccountInterface \$account, array \$context, \$entity_bundle = NULL) {
    // Check the admin_permission as defined in your @ContentEntityType
    // annotation.
    \$admin_permission = \$this->entityType->getAdminPermission();
    if (\Drupal::currentUser()->hasPermission(\$admin_permission)) {
      return AccessResult::allowed();
    }
    return AccessResult::allowedIfHasPermission(\$account, 'add @entity_name entity');
  }

}

Eof;

    $ret = strtr($template, array(
      "@module_name" => $this->config['name'],
      "@entity_name" => $entity_name,
	  "@EntityName" => $EntityName,
    ));
	
    return $ret;
  }

  /**
   * generate access control handler php content.
   */
  public function generateAdvancedAccessControlHandlerPhp(ContentType $content_type, $entity_name, $EntityName) {
  $template = <<<Eof
<?php

namespace Drupal\@module_name;

use Drupal\Core\Access\AccessResult;
use Drupal\Core\Entity\EntityAccessControlHandler;
use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Session\AccountInterface;

/**
 * Access controller for the @entity_name entity.
 */
class @EntityNameAccessControlHandler extends EntityAccessControlHandler {

  /**
   * {@inheritdoc}
   *
   * Link the activities to the permissions. checkAccess() is called with the
   * \$operation as defined in the routing.yml file.
   */
  protected function checkAccess(EntityInterface \$entity, \$operation, AccountInterface \$account) {
    // Check the admin_permission as defined in your @ContentEntityType
    // annotation.
    \$admin_permission = \$this->entityType->getAdminPermission();
    if (\Drupal::currentUser()->hasPermission(\$admin_permission)) {
      return AccessResult::allowed();
    }
    switch (\$operation) {
      case 'view':
        return AccessResult::allowedIfHasPermission(\$account, 'view @entity_name entity');

      case 'update':
        \$permissions[] = 'edit @entity_name entity';
        if(\$entity->getOwnerId() === \$account->id()){
          \$permissions[] = 'edit own @entity_name entity';
        }
        return AccessResult::allowedIfHasPermissions(\$account, \$permissions, 'OR');

      case 'delete':
        \$permissions[] = 'delete @entity_name entity';
        if(\$entity->getOwnerId() === \$account->id()){
          \$permissions[] = 'delete own @entity_name entity';
        }
        return AccessResult::allowedIfHasPermissions(\$account, \$permissions, 'OR');
    }
    return AccessResult::neutral();
  }

  /**
   * {@inheritdoc}
   *
   * Separate from the checkAccess because the entity does not yet exist. It
   * will be created during the 'add' process.
   */
  protected function checkCreateAccess(AccountInterface \$account, array \$context, \$entity_bundle = NULL) {
    // Check the admin_permission as defined in your @ContentEntityType
    // annotation.
    \$admin_permission = \$this->entityType->getAdminPermission();
    if (\Drupal::currentUser()->hasPermission(\$admin_permission)) {
      return AccessResult::allowed();
    }
    return AccessResult::allowedIfHasPermission(\$account, 'add @entity_name entity');
  }

}

Eof;

    $ret = strtr($template, array(
      "@module_name" => $this->config['name'],
      "@entity_name" => $entity_name,
	  "@EntityName" => $EntityName,
    ));
	
    return $ret;
  }  

  /**
   * generate access control handler php content.
   */
  public function generateStorageSchemaPhp(ContentType $content_type, $entity_name, $EntityName) {
  $template = <<<Eof
<?php

namespace Drupal\@module_name;

use Drupal\Core\Entity\Sql\SqlContentEntityStorageSchema;
use Drupal\Core\Field\FieldStorageDefinitionInterface;

/**
 * Defines the @entity_name schema handler.
 */
class @EntityNameStorageSchema extends SqlContentEntityStorageSchema {

  /**
   * {@inheritdoc}
   */
  protected function getSharedTableFieldSchema(FieldStorageDefinitionInterface \$storage_definition, \$table_name, array \$column_mapping) {
    \$schema = parent::getSharedTableFieldSchema(\$storage_definition, \$table_name, \$column_mapping);
    \$field_name = \$storage_definition->getName();
    \$index_fields = [@index_fields];
    if(in_array(\$field_name, \$index_fields)){
      \$this->addSharedTableFieldIndex(\$storage_definition, \$schema, TRUE);
	}
    return \$schema;
  }

}
Eof;
    $index_fields = "";
    foreach ($content_type->getBaseFields() as $base_field) {
      if($base_field->hasIndex()){
        $index_fields .= "'" . $base_field->getFieldName() . "', ";
      }
    }
    if(strlen($index_fields) > 0){
      $index_fields = substr($index_fields,0,strlen($index_fields)-2); 
    }
    $ret = strtr($template, array(
      "@module_name" => $this->config['name'],
      "@entity_name" => $entity_name,
	  "@EntityName" => $EntityName,
      "@index_fields" => $index_fields, 
    ));
	
    return $ret;
  }
  
  /**
   * generate entity twig content.
   */
  public function generateEntityTwig(ContentType $content_type, $entity_name, $EntityName) {
  $template = <<<Eof
{#
/**
 * @file
 * Default theme implementation to present all @entity_name data.
 *
 * This template is used when viewing a @entity_name's page.
 *
 * Available variables:
 * - content: A list of content items. Use 'content' to print all content, or
 *   print a subset such as 'content.field_example'.
 * - attributes: HTML attributes for the container element.
 * - @entity_name: A Drupal @entity_name entity.
 *
 * @see template_preprocess_user()
 *
 * @ingroup themeable
 */
#}
<article{{ attributes }}>
  {% if content %}
    {{- content -}}
  {% endif %}
</article>
Eof;

    $ret = strtr($template, array(
      "@entity_name" => $entity_name,
    ));
	
    return $ret;
  }  
  

  /**
   * generate permissions yml.
   */
  public function generatePermissionsYml() {
  $template = <<<Eof

'delete @entity_name entity':
  title: 'Delete @entity_name entity'
'add @entity_name entity':
  title: 'Add @entity_name entity'
'view @entity_name entity':
  title: 'View @entity_name entity'
'edit @entity_name entity':
  title: 'Edit @entity_name entity'
'administer @entity_name entity':
  title: 'Administer @entity_name entity'

Eof;

  $template_advanced = <<<Eof

'delete @entity_name entity':
  title: 'Delete @entity_name entity'
'add @entity_name entity':
  title: 'Add @entity_name entity'
'view @entity_name entity':
  title: 'View @entity_name entity'
'edit @entity_name entity':
  title: 'Edit @entity_name entity'
'edit own @entity_name entity':
  title: 'Edit own @entity_name entity'
'delete own @entity_name entity':
  title: 'Delete own @entity_name entity'
'administer @entity_name entity':
  title: 'Administer @entity_name entity'

Eof;
    $ret = "";

	$content_types = isset($this->config['content_types']) ? $this->config['content_types'] : [];
    foreach($content_types as $content_type_id){
      $content_type = \Drupal::entityTypeManager()->getStorage('content_type')->load($content_type_id);
	  $mode = $content_type->getMode();
	  if($mode === 'basic' || $mode === 'basic_plus'){		
        $ret .= strtr($template, array(
          "@entity_name" => $content_type_id,
        ));
	  }elseif($mode === 'advanced'|| $mode === 'full'){
        $ret .= strtr($template_advanced, array(
          "@entity_name" => $content_type_id,
        ));		  
	  }
    }
	
    return $ret;
  }

  /**
   * generate links action yml.
   */
  public function generateLinksActionYml() {
  $template = <<<Eof

@module_name.@entity_name_add:
  route_name: @module_name.@entity_name_add
  title: 'Add @entity_name'
  appears_on:
    - entity.@entity_name.collection

Eof;

  $template_plus = <<<Eof

@module_name.@entity_name_add:
  route_name: @module_name.@entity_name_add
  title: 'Add @entity_name'
  appears_on:
    - entity.@entity_name.collection

@module_name.@entity_name_type_add:
  route_name: @module_name.@entity_name_type_add
  title: 'Add @entity_name type'
  appears_on:
    - entity.@entity_name_type.collection
Eof;
    $ret = "";

	$content_types = isset($this->config['content_types']) ? $this->config['content_types'] : [];
    foreach($content_types as $content_type_id){
      $content_type = \Drupal::entityTypeManager()->getStorage('content_type')->load($content_type_id);
	  $mode = $content_type->getMode();
	  if($mode === 'basic'){
        $ret .= strtr($template, array(
          "@module_name" => $this->config['name'],
          "@entity_name" => $content_type_id,
        ));
	  }elseif($mode === 'basic_plus' || $mode === 'advanced'|| $mode === 'full'){
        $ret .= strtr($template_plus, array(
          "@module_name" => $this->config['name'],
          "@entity_name" => $content_type_id,
        ));		  
	  }
    }
	
    return $ret;
  }

  /**
   * generate links task yml.
   */
  public function generateLinksTaskYml() {
  $template = <<<Eof

entity.@entity_name.canonical:
  route_name: entity.@entity_name.canonical
  base_route: entity.@entity_name.canonical
  title: 'View'
entity.@entity_name.edit_form:
  route_name: entity.@entity_name.edit_form
  base_route: entity.@entity_name.canonical
  title: Edit
entity.@entity_name.delete_form:
  route_name: entity.@entity_name.delete_form
  base_route: entity.@entity_name.canonical
  title: Delete
  weight: 10
entity.@entity_name.collection:
  route_name: entity.@entity_name.collection
  title: 'List'
  base_route: entity.@entity_name.collection

Eof;

  $template_plus = <<<Eof

entity.@entity_name.canonical:
  route_name: entity.@entity_name.canonical
  base_route: entity.@entity_name.canonical
  title: 'View'
entity.@entity_name.edit_form:
  route_name: entity.@entity_name.edit_form
  base_route: entity.@entity_name.canonical
  title: Edit
entity.@entity_name.delete_form:
  route_name: entity.@entity_name.delete_form
  base_route: entity.@entity_name.canonical
  title: Delete
  weight: 10
entity.@entity_name.collection:
  route_name: entity.@entity_name.collection
  title: 'List'
  base_route: entity.@entity_name.collection
@entity_name_list_sub:
  title: 'List'
  route_name: entity.@entity_name.collection
  parent_id: entity.@entity_name.collection
entity.@entity_name_type.collection:
  title: '@entity_name types'
  route_name: entity.@entity_name_type.collection
  base_route: entity.@entity_name.collection
entity.@entity_name_type.edit_form:
  route_name: entity.@entity_name_type.edit_form
  base_route: entity.@entity_name_type.edit_form
  title: 'Edit'

Eof;
    $ret = "";

	$content_types = isset($this->config['content_types']) ? $this->config['content_types'] : [];
    foreach($content_types as $content_type_id){
      $content_type = \Drupal::entityTypeManager()->getStorage('content_type')->load($content_type_id);
	  $mode = $content_type->getMode();
	  if($mode === 'basic'){		
        $ret .= strtr($template, array(
          "@entity_name" => $content_type_id,
        ));
	  }else if($mode === 'basic_plus' || $mode === 'advanced'|| $mode === 'full'){
        $ret .= strtr($template_plus, array(
          "@entity_name" => $content_type_id,
        ));		  
	  }
    }
	
    return $ret;
  }

  /**
   * generate links menu yml.
   */
  public function generateLinksMenuYml() {
  $template = <<<Eof

entity.@entity_name.collection:
  title: '@EntityNames'
  parent: system.admin_structure
  description: 'Create and manage fields, forms, and display settings for your @entity_name.'
  route_name: entity.@entity_name.collection

Eof;
    $ret = "";

	$content_types = isset($this->config['content_types']) ? $this->config['content_types'] : [];
    foreach($content_types as $content_type_id){
	  $EntityName = ucwords(str_replace('_', ' ', $content_type_id));
      $ret .= strtr($template, array(
        "@entity_name" => $content_type_id,
        "@EntityName" => $EntityName,
      ));
    }
	
    return $ret;
  }

  /**
   * generate routing yml.
   */
  public function generateRoutingYml() {
  $template = <<<Eof

entity.@entity_name.canonical:
  path: '@path_view'
  defaults:
    _entity_view: '@entity_name'
    _title: '@entity_name content'
  requirements:
    _entity_access: '@entity_name.view'

entity.@entity_name.edit_form:
  path: '@path_edit'
  defaults:
    _entity_form: @entity_name.default
    _title: 'Edit @entity_name'
  requirements:
    _entity_access: '@entity_name.update'

entity.@entity_name.delete_form:
  path: '@path_delete'
  defaults:
    _entity_form: @entity_name.delete
    _title: 'Delete @entity_name'
  requirements:
    _entity_access: '@entity_name.delete'

entity.@entity_name.collection:
  path: '/admin/structure/@entity_names'
  defaults:
    _entity_list: '@entity_name'
    _title: '@EntityNames'
  requirements:
    _permission: 'administer @entity_name entity'

@module_name.@entity_name_add:
  path: '@path_add'
  defaults:
    _entity_form: @entity_name.default
    _title: 'Add @entity_name'
  requirements:
    _entity_create_access: '@entity_name'

Eof;

  $template_plus = <<<Eof

entity.@entity_name.canonical:
  path: '@path_view'
  defaults:
    _entity_view: '@entity_name'
    _title: '@entity_name content'
  requirements:
    _entity_access: '@entity_name.view'

entity.@entity_name.edit_form:
  path: '@path_edit'
  defaults:
    _entity_form: @entity_name.default
    _title: 'Edit @entity_name'
  requirements:
    _entity_access: '@entity_name.update'

entity.@entity_name.delete_form:
  path: '@path_delete'
  defaults:
    _entity_form: @entity_name.delete
    _title: 'Delete @entity_name'
  requirements:
    _entity_access: '@entity_name.delete'

entity.@entity_name.collection:
  path: '/admin/structure/@entity_names'
  defaults:
    _entity_list: '@entity_name'
    _title: '@EntityNames'
  requirements:
    _permission: 'administer @entity_name entity'

entity.@entity_name_type.collection:
  path: '/admin/structure/@entity_names/types'
  defaults:
    _entity_list: '@entity_name_type'
    _title: '@EntityName types'
  requirements:
    _permission: 'administer @entity_name entity'    

entity.@entity_name_type.edit_form:
  path: '/admin/structure/@entity_names/manage/{@entity_name_type}'
  defaults:
    _entity_form: @entity_name_type.default
  requirements:
    _permission: 'administer @entity_name entity'
    
entity.@entity_name_type.delete_form:
  path: '/admin/structure/@entity_names/manage/{@entity_name_type}/delete'
  defaults:
    _entity_form: @entity_name_type.delete
  requirements:
    _permission: 'administer @entity_name entity'

@module_name.@entity_name_type_add:
  path: '/admin/structure/@entity_names/types/add'
  defaults:
    _entity_form: '@entity_name_type.add'
    _title: 'Add'
  requirements:
    _permission: 'administer @entity_name entity'

@module_name.@entity_name_add:
  path: '@path_add'
  defaults:
    _controller: '\Drupal\@module_name\Controller\@EntityNameController::add'
    _title: 'Add @entity_name'
  requirements:
    _entity_create_access: '@entity_name'

@module_name.@entity_name_add_form:
  path: '@path_add/{@entity_name_type}'
  defaults:
    _controller: '\Drupal\@module_name\Controller\@EntityNameController::addForm'
    _title_callback: '\Drupal\@module_name\Controller\@EntityNameController::getAddFormTitle'
  requirements:
    _entity_create_access: '@entity_name'

Eof;
    $ret = "";

	$content_types = isset($this->config['content_types']) ? $this->config['content_types'] : [];
    foreach($content_types as $content_type_id){
      $content_type = \Drupal::entityTypeManager()->getStorage('content_type')->load($content_type_id);
      $paths = $content_type->getEntityPaths();
      $path_view = !empty($paths['view']) ? $paths['view'] : "/$content_type_id/{" . $content_type_id . "}";
      $path_add = !empty($paths['add']) ? $paths['add'] : "/$content_type_id/add";
      $path_edit = !empty($paths['edit']) ? $paths['edit'] : "/$content_type_id/{" . $content_type_id . "}/edit";
      $path_delete = !empty($paths['delete']) ? $paths['delete'] : "/$content_type_id/{" . $content_type_id . "}/delete";	
	  $EntityName = ucwords(str_replace('_', ' ', $content_type_id));
	  $mode = $content_type->getMode();
	  if($mode === 'basic'){
        $ret .= strtr($template, array(
          "@entity_name" => $content_type_id,
          "@EntityName" => $EntityName,		
          "@path_view" => $path_view,
          "@path_add" => $path_add,
          "@path_edit" => $path_edit,
          "@path_delete" => $path_delete,		
          "@module_name" => $this->config['name'],
        ));
	  }elseif($mode === 'basic_plus' || $mode === 'advanced'|| $mode === 'full'){
        $ret .= strtr($template_plus, array(
          "@entity_name" => $content_type_id,
          "@EntityName" => $EntityName,		
          "@path_view" => $path_view,
          "@path_add" => $path_add,
          "@path_edit" => $path_edit,
          "@path_delete" => $path_delete,		
          "@module_name" => $this->config['name'],
        ));		  
	  }
    }
	
    return $ret;
  }
  
  /**
   * generate links menu yml.
   */
  public function generateSchemaYml() {
  $template = <<<Eof

@module_name.@entity_name_type.*:
  type: config_entity
  label: '@entity_name type settings'
  mapping:
    id:
      type: string
      label: 'ID'
    label:
      type: label
      label: 'Label'
    description:
      type: text
      label: 'Description'

Eof;
    $ret = "";

	$content_types = isset($this->config['content_types']) ? $this->config['content_types'] : [];
    foreach($content_types as $content_type_id){
      $content_type = \Drupal::entityTypeManager()->getStorage('content_type')->load($content_type_id);
      $mode = $content_type->getMode();
	  if($mode !== 'basic'){
	    $EntityName = ucwords(str_replace('_', ' ', $content_type_id));
        $ret .= strtr($template, array(
          "@entity_name" => $content_type_id,
          "@EntityName" => $EntityName,
		  "@module_name" => $this->config['name'],
        ));
      }
    }
	
    return $ret;
  }  
  
  
  
  /**
   * generate access control handler php content.
   */
  public function generateEntityControllerPhp(ContentType $content_type, $entity_name, $EntityName) {
  $template = <<<Eof
<?php

namespace Drupal\@module_name\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Link;
use Drupal\Core\Url;
use Symfony\Component\HttpFoundation\Request;
use Drupal\@module_name\@EntityNameTypeInterface;

class @EntityNameController extends ControllerBase {


  /**
   * Displays add  links for available types.
   *
   * @param \Symfony\Component\HttpFoundation\Request \$request
   *   The current request object.
   *
   * @return array
   *   A render array for a list of the entity types that can be added.
   */
  public function add(Request \$request) {
    \$build = [
      '#theme' => 'entity_add_list',
      '#cache' => [
        'tags' => \$this->entityTypeManager()->getDefinition('@entity_name_type')->getListCacheTags(),
      ],
    ];

    \$bundles = [];

    \$types = \$this->entityTypeManager()->getStorage('@entity_name_type')->loadMultiple();

    foreach (\$types as \$type) {
      //\$access = \$this->entityTypeManager()->getAccessControlHandler('@entity_name')->createAccess(\$type->id(), NULL, [], TRUE);
      //if (\$access->isAllowed()) {
        \$bundles[\$type->id()] = [
		  'add_link' =>  Link::fromTextAndUrl(\$type->label(), Url::fromRoute('@module_name.@entity_name_add_form', ['@entity_name_type' => \$type->id()]))->toString(),
		  'label' => \$type->label(),
		  'description' => \$type->getDescription(),
		];
      //}
      //\$this->renderer->addCacheableDependency(\$build, \$access);
    }



    \$build['#bundles'] = \$bundles;
	return \$build;
  }

  /**
   * Presents the entity creation form.
   *
   * @param \Drupal\@module_name\@EntityNameTypeInterface \$@entity_name_type
   *   The @entity_name type to add.
   * @param \Symfony\Component\HttpFoundation\Request \$request
   *   The current request object.
   *
   * @return array
   *   A form array as expected by
   *   \Drupal\Core\Render\RendererInterface::render().
   */
  public function addForm(@EntityNameTypeInterface \$@entity_name_type, Request \$request) {
    \$entity = \$this->entityTypeManager()->getStorage("@entity_name")->create([
      'type' => \$@entity_name_type->id(),
    ]);

    return \$this->entityFormBuilder()->getForm(\$entity);
  }
  
  /**
   * Provides the page title for this controller.
   *
   * @param \Drupal\@module_name\@EntityNameTypeInterface \$@entity_name_type
   *   The @entity_name type being added.
   *
   * @return string
   *   The page title.
   */
  public function getAddFormTitle(@EntityNameTypeInterface \$@entity_name_type) {
    return \$this->t('Add %type @entity_name', ['%type' => \$@entity_name_type->label()]);
  }  

}

Eof;

    $ret = strtr($template, array(
      "@module_name" => $this->config['name'],
      "@entity_name" => $entity_name,
	  "@EntityName" => $EntityName,
    ));
	
    return $ret;
  }    
  
}
