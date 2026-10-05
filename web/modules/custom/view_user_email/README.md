# View User Email

## DEPRECATED - Only needed for Drupal 8.x and 9.0-9.1

**This module is deprecated and only needed for older Drupal versions.**

Starting with **Drupal 9.2**, this functionality is included in core. If you are running Drupal 9.2 or higher (including Drupal 10 and 11), you should:

1. **Use the core permission instead**: Go to /admin/people/permissions and enable "View user email addresses" for the desired roles
2. **Uninstall this module** - it is no longer needed

This module should only be used on:
- Drupal 8.x sites
- Drupal 9.0 and 9.1 sites

## About

The View User Email module is a very simple module which allows site administrators to grant access to certain roles to see other users email field.

You need this module only if you want to allow the default email field to be seen by certain roles. It has security implications though.

## How to use:
1. Install the module. (How-to install a module)
2. Go to /admin/people/permissions and search for the Access other users email field permission
3. Assign the permission to the desired roles and enjoy.
