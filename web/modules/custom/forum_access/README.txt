CONTENTS OF THIS FILE
---------------------

 * Introduction
 * Requirements
 * Permissions
 * Installation
 * Configuration
 * Troubleshooting
 * Maintainers


INTRODUCTION
------------

This module changes your forum administration page to allow you to set forums
private. You can control what user roles can view, edit, delete, and post to
each forum. You can also give each forum a list of users who have administrative
access on that forum (AKA moderators).

 * For a full description of the module, visit the project page:
   https://www.drupal.org/project/forum_access

 * To submit bug reports and feature suggestions, or to track changes:
   https://www.drupal.org/project/issues/forum_access


REQUIREMENTS
------------

This module requires the Drupal Core Forum module and the contributed ACL
module.


PERMISSIONS
-----------

Administering Forum Access requires Core's Administer Forums permission.
Detailed explanations of how Forum Access' grants work together with Core's
other permissions are available on the administration pages.


INSTALLATION
------------

 * Install the Forum Access module as you would normally install a contributed
   Drupal module. Visit
   https://www.drupal.org/node/1897420 for further information.


CONFIGURATION
-------------

    1. Navigate to Administration > Extend and enable the module.
    2. Rebuild the permissions.
    3. Forum Access does not have its own administration page. Navigate to
       Administration > Structure > Forums > Edit/Add Forum/Container for
       the controls. Save.


TROUBLESHOOTING
---------------

Step-by-step troubleshooting instructions are provided on the administration
pages.

In case you have additional node access modules enabled, the administration
pages will provide additional information on how to make them work together.


MAINTAINERS
-----------

 * Hans Salvisberg (salvis) - https://www.drupal.org/u/salvis
 * Earl Miles (merlinofchaos) - https://www.drupal.org/u/merlinofchaos

Supporting organizations:

 * Salvisberg Software & Consulting
   https://www.drupal.org/salvisberg-software-consulting

Acknowledgments:

 * Originally written for Drupal 5 and maintained by merlinofchaos.
 * Ported to Drupal 6 and 7 and maintained by salvis.
 * Ported to Drupal 8 by nevergone (Kurucz István), maintained by salvis.
