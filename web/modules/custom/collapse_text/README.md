# Collapse Text

[[_TOC_]]

## Introduction

The `collapse_text` module is an input filter which allows sections of content
to be made *collapsible* (like on editing forms).\
For example, a common use case is the creation of a FAQ page, with a list of
questions, with each answer displaying when a question is clicked.

## Installation and configuration

<img src="https://www.drupal.org/files/project-images/collapse_text-full-html-config-form1a.jpeg"
width="33%" align="right" style="margin-left:15px;">

1. Prerequisites:\
Requires the [Core Filter module][1] to be enabled.

1. Installation:\
Install with `composer` or download the module and copy it into your
contributed modules folder (for example, `/modules/contrib/`) and enable it
from the modules administration page _(requires the filter module to be
enabled)_.\
More information at: [Extending Drupal: Installing Modules][2].

1. Configuration (see screenshot on the right):\
After successful installation, browse to the [Text formats and editors][3] admin
overview page (`admin/config/content/formats`) and edit the format for which the
filter should be enabled, for example, `Full HTML`
(`admin/config/content/formats/manage/full_html`).
    1. Check `Collapsible text blocks` in the list of `Enabled filters`.
    1. Configure the `Collapse Text` filter after the `HTML Corrector`, if it
    is enabled, see [Known issues](#known-issues) below.
    1. (Optional) Configure filter settings or leave as default.

## Usage

Surround a section of text with `[collapse]` and `[/collapse]` to make it
collapsible. `[collapse]` tags can be nested within one another.

The `[collapsed]` tag can be used to make the section display initially
collapsed and is a shorter alias for `[collapse collapsed]` (also valid).

The parameters may be combined in (almost) any order. The `collapsed` parameter
must come right after the tag word `collapse`. If it is not specified first, it
should be declared as an attribute `collapsed="collapsed"`, for example:

```html
[collapse title="Section title" collapsed="collapsed" class="example-class1"]
```

Angle brackets may also be used instead of straight brackets to surround the
collapse tag: `<collapse>` (turned into `[collapse]` and work the same way).

### The 'title' of the section

<img src="https://www.drupal.org/files/project-images/collapse_text-full-html-rich-text-editor1a.jpeg"
width="34%" align="right" style="margin-left:15px;">
The title of the section may be specified in two ways:

- As a `title=` attribute in the opening tag, as follows:
  `[collapse title="collapsible section title here"]`\
  Titles should be surrounded by double-quotes and can include HTML entities,
  such as `&quot;` or `&amp;`.\
  However, currently *HTML tags in the title attribute are not supported*.
  To include nested tags (such as `<em>` or `<a>`), see the next point.
- **If a title attribute is not specified** in the `[collapse]` tag, the filter
  will attempt to look for a title in the content of the section and will select
  the first HTML header (`<h1>`, `<h2>`, ..., `<h6>`) to be used as the title.
  In this case, the selected header tag will be removed from the content upon
  display to prevent duplication. Any HTML tag nested in the header will then be
  carried over in section's title. For example:

```html
[collapse]
<h1>Title heading with <em>emphasis</em> and <a href="#">some link</a></h1>
<p>Some text</p>
[/collapse]
```

Lastly, if a title attribute is not specified and no header tag is found as
replacement, the default title configured in text format's settings form will be
used (see under 'Filter settings').

### The 'class' attribute

Additional CSS classes can be added to the section with the `class=` attribute,
as follows: `[collapse class="class1 class2 class3"]`.\
Classes should be surrounded by double-quotes, and separated with spaces.

### Examples

The following code examples will create collapsible text sections:

```html
[collapse class="class-example" title="Collapse Text example"]
This text can be hidden by clicking on the header.
[/collapse]

[collapse collapsed="collapsed" class="class-example" title="Section collapsed example"]
This text can be displayed by clicking on the header.
[/collapse]

[collapse]
<h1>Title heading with <em>emphasis</em> and <a href="#">some link</a></h1>
<p>Example text with markup.</p>
[/collapse]
```

<img src="https://www.drupal.org/files/project-images/collapse_text-node-full-view1a.jpeg"
width="33%" align="right" style="margin-left:15px;">

## Theming

The module provides two template files that can be overridden if required:

- `collapse-text-details.html.twig` renders the actual details.
- `collapse-text-form.html.twig` renders the enclosing form.

_Preprocessing functions_ can be used as for any regular theme function, for
example: `HOOK_preprocess_collapse_text_details()`.

## Known issues

### Integration (with other modules)

Other filters, such as the _HTML corrector_
(`Correct faulty and chopped off HTML`), `media`, `entity_embed` and probably
many other filter modules are known to cause issues with collapse text.

If other conflicting filters are enabled, it is important to configure collapse
text to run after them, by ordering it below (heavier than) other filters, under
`Filter processing order`, see screenshot and configuration steps from section
[Installation and configuration](#installation-and-configuration) above.

### Conflicts with the string '[collapse'

Since the filter relies on the pseudo tag `[collapse`, any occurrence of the
string will be interpreted by the module as a *collapsible section*. Therefore,
if for some reason the actual string needs to be displayed (in the content), it
should be escaped by prefixing it with a backslash: `\[collapse`.
The first backslash before any instance of `[collapse` will be removed from the
final displayed text, so for example, `\\[collapse]` will display `\[collapse`
and so forth.

### Legacy attributes

For backwards compatibility, the module supports a few variations which **should
not be used going forward**./
The `class=` parameter used to be `style=` and the `style=` and `title=`
parameters did not require quotes. For this to work, the parameter `style=` must
come before the `title=`.

## Similar modules

- [CKEditor Accordion][5]: Similar features, but creates accordions instead of
collapsibles.

## Support and maintenance

Releases of the module can be requested or will generally be created based on
the state of the development branch or the priority of committed patches.

Feel free to follow up in the [issue queue][6] for any contributions, bug
reports, feature requests. Create a ticket in module's issue tracker to describe
the problem encountered, document a feature request or upload a patch.\
Any contribution is greatly appreciated.

[1]: https://www.drupal.org/docs/core-modules-and-themes/core-modules/filter-module
[2]: https://www.drupal.org/docs/extending-drupal/installing-modules
[3]: https://www.drupal.org/docs/user_guide/en/structure-text-format-config.html
[4]: https://www.drupal.org/files/project-images/exclude.png
[5]: https://www.drupal.org/project/ckeditor_accordion
[6]: https://www.drupal.org/project/issues/collapse_text
