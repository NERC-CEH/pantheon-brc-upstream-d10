CONTENTS OF THIS FILE
---------------------

* Introduction
* Requirements
* Installation
* Configuration
* Maintainers


INTRODUCTION
------------

Responsive wrappers module adds a new filter in your input formats that checks
the content and adds the video wrapper for responsive videos with 16/9 or 4/3
ratio aspect, the table wrapper and image class to control responsive
breakpoints and content size.

This is useful because users can use the WYSIWYG to add videos, tables or
images and magically append the responsive wrappers, without the need to allow
users to create divs or know or remember to add the bootstrap responsive
wrappers or classes.

This module can also work without Bootstrap with a custom CSS that can be added
in module settings or with custom classes.

 * For a full description of the module visit
   https://www.drupal.org/project/responsivewrappers

 * To submit bug reports and feature suggestions, or to track changes visit
   https://www.drupal.org/project/issues/responsivewrappers


REQUIREMENTS
------------

This module requires Drupal core.


INSTALLATION
------------

To install the Responsive Wrappers module for Drupal, run the following
command: composer require drupal/responsivewrappers

or download it from https://www.drupal.org/project/responsivewrappers and place
in your modules/contrib directory.

For further information, see:
https://www.drupal.org/docs/develop/using-composer/using-composer-to-manage-drupal-site-dependencies


CONFIGURATION
-------------

To set up Responsive Wrappers module do the following:

 * Enable the module.

 * Go to your input formats: admin/config/content/formats

 * Add the responsive wrapper filter in your input format.

 * Configure the input format as desired.

 * If you want a Bootstrap 3 output instead of the Bootstrap 4/5 default output
  or more advanced settings like attach responsive CSS or custom classes go to
  module settings: admin/config/content/responsivewrappers


MAINTAINERS
-----------

Current maintainers:

 * Oriol Roselló Castells (oriol_e9g) - https://www.drupal.org/u/oriol_e9g

For additional information, see the project page on Drupal.org
<https://www.drupal.org/project/responsivewrappers>
