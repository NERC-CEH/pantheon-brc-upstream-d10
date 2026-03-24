# Forum Access

This module changes your forum administration page to allow you to set forums
private. You can control what user roles can view, edit, delete, and post to
each forum. You can also give each forum a list of users who have administrative
access on that forum (AKA moderators).

- For the description of the module visit:
[project page](https://www.drupal.org/project/forum_access).

- To submit bug reports and feature suggestions or to track changes, visit:
[issue queue](https://www.drupal.org/project/issues/forum_access).


## Table of contents

- Requirements
- Permissions
- Installation
- Configuration
- Troubleshooting
- Maintainers


## Requirements

This module requires the following modules:

- Core Forum module
- [ACL](https://www.drupal.org/project/acl)


## Permissions

Administering Forum Access requires Core's Administer Forums permission.
Detailed explanations of how Forum Access' grants work together with Core's
other permissions are available on the administration pages.


## Installation

Install as you would normally install a contributed Drupal module. For further
information, see
[Installing Drupal Modules](https://www.drupal.org/docs/extending-drupal/installing-drupal-modules).


## Configuration

1. Navigate to Administration > Extend and enable the module.
1. Rebuild the permissions.
1. Forum Access does not have its own administration page. Navigate to
   Administration > Structure > Forums > Edit/Add Forum/Container for
   the controls. Save.


## Troubleshooting

- Step-by-step troubleshooting instructions are provided on the administration
  pages.

- In case you have additional node access modules enabled, the administration
  pages will provide additional information on how to make them work together,
  and you should probably follow the troubleshooting instructions to install
  DNA and learn about how your combination of node access modules works.


## Maintainers

- Hans Salvisberg - [salvis]
(https://www.drupal.org/u/salvis)
- Mikhail Khasaya - [dillix]
(https://www.drupal.org/u/dillix)
- Earl Miles - [merlinofchaos]
(https://www.drupal.org/u/merlinofchaos)
