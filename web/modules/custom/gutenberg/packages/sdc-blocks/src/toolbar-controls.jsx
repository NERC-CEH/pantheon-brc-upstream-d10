import {
  PanelBody,
  TextControl,
  TextareaControl,
  ToggleControl,
  SelectControl,
  RangeControl,
  __experimentalNumberControl as NumberControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Get the primary type from a prop schema type field.
 * SDC appends 'object' to all types, so we pick the first non-object type.
 *
 * @param {Array|string} type The type or types array.
 * @return {string} The primary type.
 */
function getPrimaryType(type) {
  const types = Array.isArray(type) ? type : [type];
  return types.find((t) => t && t !== 'object') || types[0] || 'string';
}

/**
 * Check if a prop is a Drupal class type (e.g., Drupal\Core\Template\Attribute).
 *
 * @param {Array|string} type The type or types array.
 * @return {boolean}
 */
function isDrupalClassType(type) {
  const types = Array.isArray(type) ? type : [type];
  return types.some(
    (t) => t && typeof t === 'string' && t.startsWith('Drupal\\'),
  );
}

/**
 * Toolbar controls for non-text props.
 *
 * Currently unused — variant selector and prop controls live in the sidebar.
 * Kept as a placeholder for future toolbar-specific controls.
 */
export function ToolbarControls() {
  return null;
}

/**
 * Sidebar controls for complex non-text props.
 *
 * Renders URL fields, number inputs, range sliders, and JSON editors
 * in the InspectorControls sidebar.
 */
export function SidebarControls({ schema, props, onChange, inlineProps, variants, variant, onVariantChange }) {
  const controls = [];

  // Variant selector.
  if (variants && Object.keys(variants).length > 0) {
    controls.push(
      <SelectControl
        key="sdc-variant"
        label={__('Variant')}
        value={variant}
        options={Object.entries(variants).map(([key, def]) => ({
          label: def.title || key,
          value: key,
        }))}
        onChange={(value) => onVariantChange(value)}
      />,
    );
  }

  if (!schema || !schema.properties) {
    if (controls.length === 0) {
      return null;
    }
    return (
      <PanelBody title={__('Component Settings')} initialOpen>
        {controls}
      </PanelBody>
    );
  }

  Object.entries(schema.properties).forEach(([name, propSchema]) => {
    // Skip inline-editable props.
    if (inlineProps.includes(name)) {
      return;
    }

    // Skip Drupal class types.
    if (isDrupalClassType(propSchema.type)) {
      return;
    }

    const primaryType = getPrimaryType(propSchema.type);
    const title = propSchema.title || name;
    const description = propSchema.description || '';

    // Boolean toggle.
    if (primaryType === 'boolean') {
      controls.push(
        <ToggleControl
          key={name}
          label={title}
          help={description}
          checked={!!props[name]}
          onChange={(value) => onChange({ [name]: value })}
        />,
      );
      return;
    }

    // Enum select.
    if (propSchema.enum) {
      const options = propSchema.enum.map((val) => ({
        label:
          (propSchema['meta:enum'] && String(propSchema['meta:enum'][val])) ||
          String(val),
        value: String(val),
      }));

      controls.push(
        <SelectControl
          key={name}
          label={title}
          help={description}
          value={String(props[name] ?? '')}
          options={options}
          onChange={(value) => onChange({ [name]: value })}
        />,
      );
      return;
    }

    // String with format (uri, email).
    if (primaryType === 'string') {
      const format = propSchema.format || '';
      const inputType =
        format === 'uri' || format === 'uri-reference'
          ? 'url'
          : format === 'email'
            ? 'email'
            : 'text';

      controls.push(
        <TextControl
          key={name}
          label={title}
          help={description}
          value={props[name] || ''}
          type={inputType}
          onChange={(value) => onChange({ [name]: value })}
        />,
      );
      return;
    }

    // Integer with min/max — range control.
    if (
      primaryType === 'integer' &&
      (propSchema.minimum !== undefined || propSchema.maximum !== undefined)
    ) {
      controls.push(
        <RangeControl
          key={name}
          label={title}
          help={description}
          value={props[name] || propSchema.minimum || 0}
          min={propSchema.minimum}
          max={propSchema.maximum}
          step={propSchema.multipleOf || 1}
          onChange={(value) => onChange({ [name]: value })}
        />,
      );
      return;
    }

    // Integer/number.
    if (primaryType === 'integer' || primaryType === 'number') {
      controls.push(
        <NumberControl
          key={name}
          label={title}
          help={description}
          value={props[name] !== undefined ? props[name] : ''}
          min={propSchema.minimum}
          max={propSchema.maximum}
          step={primaryType === 'integer' ? propSchema.multipleOf || 1 : 0.01}
          onChange={(value) => {
            const parsed =
              primaryType === 'integer'
                ? parseInt(value, 10)
                : parseFloat(value);
            onChange({ [name]: isNaN(parsed) ? undefined : parsed });
          }}
        />,
      );
      return;
    }

    // Object — JSON editor.
    if (primaryType === 'object') {
      controls.push(
        <TextareaControl
          key={name}
          label={`${title} (JSON)`}
          help={description || __('Enter valid JSON')}
          value={props[name] ? JSON.stringify(props[name], null, 2) : '{}'}
          onChange={(value) => {
            try {
              onChange({ [name]: JSON.parse(value) });
            } catch (e) {
              // Invalid JSON — don't update.
            }
          }}
        />,
      );
      return;
    }

    // Array — JSON array editor.
    if (primaryType === 'array') {
      controls.push(
        <TextareaControl
          key={name}
          label={`${title} (JSON Array)`}
          help={description || __('Enter valid JSON array')}
          value={props[name] ? JSON.stringify(props[name], null, 2) : '[]'}
          onChange={(value) => {
            try {
              onChange({ [name]: JSON.parse(value) });
            } catch (e) {
              // Invalid JSON — don't update.
            }
          }}
        />,
      );
    }
  });

  if (controls.length === 0) {
    return null;
  }

  return (
    <PanelBody title={__('Component Settings')} initialOpen>
      {controls}
    </PanelBody>
  );
}
