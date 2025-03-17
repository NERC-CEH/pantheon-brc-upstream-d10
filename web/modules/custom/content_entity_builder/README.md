INTRODUCTION
------------

This module allow you build a content entity type and add base field to it by config.
It also support export you content entity to module code and download it.

Bundle，revision, translatable, Owner are supported through mode options:
 * Basic: the original way , One entity One table, keep your database table clean.
 * Basic Plus : Basic + bundles support.
 * Advanced: Basic+ bundles + translatable + Owner + Changed + Published.
 * Full: a custom content type like node, Advanced + revision.
 
CONFIGURATION
-------------
 
 * add a content entity type at admin/structure/content-types, 
   for example "author",
 * at admin/structure/content-types/manage/author, add base field to it,
   for example "Name", "Age", "Description"
 * config entity type settings, include entity keys, entity paths.
   Make sure you know what you do.
 * Save and apply update
 * manage form display at 
   admin/structure/content-types/manage/author/form-display,
   manage display at admin/structure/content-types/manage/author/display
 * add content at "/author/add", the path you could config
 * Config entity permission at admin/people/permissions

MAINTAINERS
-----------

Current maintainers:
 * howard ge (g089h515r806) - https://www.drupal.org/u/g089h515r806
