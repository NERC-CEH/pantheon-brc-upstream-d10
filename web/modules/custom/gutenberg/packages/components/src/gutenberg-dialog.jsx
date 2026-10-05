import MediaBrowser from './media-browser';

const withGutenbergDialog = (Component) => {
  // Deprecated. To be removed.
  const onDialogCreate = () => {};

  const getDialog = ({ allowedTypes, onSelect }) =>
    new Promise((resolve) => {
      resolve({
        component: (props) => (
          <MediaBrowser
            {...props}
            allowedTypes={allowedTypes}
            value={[]}
            onSelect={(media) => {
              props.onSelect(props.multiple ? media : media[0]);
              onSelect();
            }}
          />
        ),
      });
    });

  return (props) => (
    <Component
      {...props}
      onDialogCreate={onDialogCreate}
      getDialog={getDialog}
    />
  );
};

export default withGutenbergDialog;
