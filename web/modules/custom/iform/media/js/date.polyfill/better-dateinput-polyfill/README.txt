HTML5 date polyfill, which can be removed once Mac OSX Safari supports HTML5 dates.
See https://caniuse.com/input-datetime.

Note this has been modified to use the browser default language for date format, rather than
the HTML lang attribute, since lang="en" is commonly used but defaults to en-US on many
browsers.