Provides landing pages for groups (sometimes known as activities or projects). After installation,
the landing page for any group can be found at the URL `/groups/<group title>`, where
`<group title>` is replaced by the title of the group in lowercase and with spaces replaced by
hyphens.

If you are using this module to provide access to a public landing page for groups, that users who
are not logged in can access, then ensure that you set the "Elasticsearch all records permission"
setting on the Configuration > IForm settings page to access iform content and ensure that
anonymous users have access to the access iform content permission on the People > Permissions
page.

# Theming the group landing page output

The Group Landing Pages module renders the landing page for a group using a theme hook called
`group_landing_page`. An example template is provided in the module's templates folder which
describes the variables available in the header comment. Copy the `group-landing-page.html.twig`
file to your theme's templates folders and modify it if you need a customised default group landing
page template.

Theme suggestions are provided to allow you to create versions of the template file specific to
certain group types, or specific to individual groups:
* `group-landing-page--type-<type>.html.twig` - replace `<type>` with the group type in lowercase
  and with non-alphabetic characters replaced by hyphens (e.g. bioblitz or local-project). This
  template will then be used for all groups of that type, unless individually overridden as
  described below.
* `group-landing-page--id-<id>.html.twig` - replace `<id>` with the numeric group unique
  identifier. This template will then be used only by that specific group.

# Blocks

The Group Landing Pages module relies on the [Twig Tweak](https://www.drupal.org/project/twig_tweak)
contributed module to allow blocks to be embedded into the templates, for example:

```twig
{{ drupal_block('es_recent_records_block', {unverified_records: true}) }}
```

In most cases you will want to specify the unverified_records config option so that unverified
records are included. A number of blocks are provided by the Indicia Blocks module which can be
embedded in templates, including the following:
* es_all_records_map_block - available variables:
  * `base_layer` - options are OpenStreetMap, OpenTopoMap, GoogleSatellite, GoogleRoadMap,
    GoogleTerrain, GoogleHybrid.
  * `map_layer_type` - options are circle, square, heat, geohash.
* es_phenology_graph_block
* es_recent_photos - available variables:
  * `limit` (count of photos, integer)
* es_recent_records_block - available variables:
  * `limit` (count of rows, integer)
* es_recent_records_map_block
* es_records_by_taxon_group_pie_block
* es_records_by_verification_status_pie_block - available options:
  * `level_2` - (1 or 0, should level 2 verification decision detail be included as a doughnut
    ring?).
* es_top_recorders_table_block - available variables:
  * `limit` (count of rows, integer)
  * `include_records` (1 or 0)
  * `include_species` (1 or 0)
  * `order_by` (set to either `records` or `species`) to control the output.
* es_totals_block

The Group Landing Pages module also provides the following blocks:
* group_landing_pages_group_page_links - a list of links to pages that have been linked to the
  group.