# Indicia Auto Exports

A module that automates periodic generation of Darwin Core Archive or other format exports from
Indicia data.

## Installation

Copy the module folder to /modules/custom then install as normal.

Currently requires records to be associated with groups (activities) so you will need to create
groups on the site to prepare exports for. The **Recording groups > Create or edit a group** form
allows this.

## MySql configuration

The metadata form created by this module is extensive with a large number of input fields. This
requires MySQL to be configured to allow large packets. If your server is not configured correctly
this will manifest in a crash when clicking Next on the form whilst inputting metadata. Drupal may
redirect you to the installation page in this instance (though you can return to your home page
without the installer doing anything) and the Drupal logs will contain an error "MySql has gone
away". If you experience this then you need to change the `max_allowed_packet` size. A setting of
64 megabytes should work well:

```
max_allowed_packet=64M
```

## Usage

Visit /form/published-group-metadata to fill in metadata form for an export.

Completed metadata forms will cause Drupal's background cron job to prepare export files when they
are due. They are prepared in Darwin Core Archive format and can be found at
/sites/default/files/indicia/exports/export-group-<group_id>.zip.