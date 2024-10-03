Provides landing pages for groups (sometimes known as activities or projects). After installation,
the landing page for any group can be found at the URL `/groups/<group title>`, where
`<group title>` is replaced by the title of the group in lowercase and with spaces replaced by
hyphens. Group landing pages arae themeable using the Drupal templating system and can include
various reports and data outputs built using group data as well as a blog of news about the group.

If you are using this module to provide access to a public landing page for groups, that users who
are not logged in can access, then ensure that you set the "Elasticsearch all records permission"
setting on the Configuration > IForm settings page to access iform content and ensure that
anonymous users have access to the access iform content permission on the People > Permissions
page.

# Theming the group landing page output

The Group Landing Pages module renders the landing page for a group using the following theme
hooks:
* `group_landing_page_tabs` - the tab container for the page.
* `group_landing_page_overview` - the main overview tab.
* `group_landing_page_progress` - the progress summary tab.
* `group_landing_page_taxa` - the taxa/species information tab.

Example templates are provided in the module's templates folder which describes the variables
available in the header comment. Copy the required files to your theme's templates folders and
modify them if you need a customised default group landing page template.

Theme suggestions are provided to allow you to create versions of the template file specific to
certain group types, to container/contained groups, or specific to individual groups:

* `<theme_hook>-type-<type>.html.twig` - replace `<type>` with the group type in lowercase
  and with non-alphabetic characters replaced by hyphens (e.g. bioblitz or local-project). This
  template will then be used for all groups of that type, unless individually overridden as
  described below.
* `<theme_hook>--contained.html.twig` - used for groups that are contained within a parent
  container group.
* `<theme_hook>--container.html.twig` - used for groups that are containers for other contained
  groups.
* `<theme_hook>--contained--type-<type>.html.twig` - used for groups that are contained within a
  parent container group and of the given type.
* `<theme_hook>--container--type-<type>.html.twig` - used for groups that are containers for other
  contained groups and of the given type.
* `<theme_hook>--contained--type-<type>--parent-id-<id>.html.twig` - used for groups that are
  contained within a parent container group with the given ID and where the contained group is of
  the given type.
* `<theme_hook>--id-<id>.html.twig` - replace `<id>` with the numeric group unique
  identifier. This template will then be used only by that specific group.

Here are some example template suggestions for the overview tab, for group ID 5, which is contained
within group ID 1 and where the type is set to "project":
* group-landing-page-overview--id-5.html.twig
* group-landing-page-overview--contained--type-project--parent-id-1.html.twig
* group-landing-page-overview--contained--type-project.html.twig
* group-landing-page-overview--contained.html.twig
* group-landing-page-overview--type-project.html.twig
* group-landing-page-overview.html.twig.

# Blocks

The Group Landing Pages module relies on the [Twig Tweak](https://www.drupal.org/project/twig_tweak)
contributed module to allow blocks to be embedded into the templates, for example:

```twig
{{ drupal_block('es_recent_records_block', {unverified_records: true}) }}
```

In most cases you will want to specify the unverified_records config option so that unverified
records are included. A number of blocks are provided by the Indicia Blocks module which can be
embedded in templates, including the following:
* es_accumulation_chart_block
* es_all_records_map_block - available variables:
  * `base_layer` - options are OpenStreetMap, OpenTopoMap, GoogleSatellite, GoogleRoadMap,
    GoogleTerrain, GoogleHybrid.
  * `map_layer_type` - options are circle, square, heat, geohash.
* es_phenology_chart_block
* es_recent_photos - available variables:
  * `limit` (count of photos, integer)
* es_recent_records_block - available variables:
  * `limit` (count of rows, integer)
* es_recent_records_map_block
* es_records_by_taxon_group_pie_block
* es_records_by_verification_status_pie_block - available options:
  * `level_2` - (1 or 0, should level 2 verification decision detail be included as a doughnut
    ring?).
* es_records_by_year_chart_block
* es_top_recorders_table_block - available variables:
  * `limit` (count of rows, integer)
  * `include_records` (1 or 0)
  * `include_species` (1 or 0)
  * `order_by` (set to either `records` or `species`) to control the output.
* es_totals_block

The Group Landing Pages module also provides the following blocks:
* group_landing_pages_group_page_links - a list of links to pages related to the group which the
  user has access to.

Refer to the provided template (templates/group-landing-page-overview.html.twig) for and example of
how to include the group blog entries view on the page.