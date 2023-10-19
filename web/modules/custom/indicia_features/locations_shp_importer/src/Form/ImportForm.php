<?php
/**
 * @file
 * Contains \Drupal\locations_shp_importer\Form\ImportForm.
 */

namespace Drupal\locations_shp_importer\Form;

use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Implements a form for importing from SHP file.
 */
class ImportForm extends FormBase {

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'locations_shp_importer_import_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $form = [];
    iform_load_helpers([]);
    global $indicia_templates;
    $msg = $this->t('To use this tool, you need a set of files in SHP format, including at least a file called *.shp and a file called *.dbf.');
    $msg .= ' ' . $this->t('The SHP file attributes in the *.dbf file must include an attribute which provides a name and an optional code for each location.');
    $msg .= ' ' . $this->t('Select your files and add them to a *.zip file, not in a sub-folder, then upload the zip file below.');
    $instruct = str_replace(
      '{message}',
      $msg,
      $indicia_templates['messageBox']
    );
    $form['instruct'] = [
      '#markup' => $instruct,
    ];
    $form['file'] = [
      '#title' => $this->t('Upload a Zipped set of SHP files'),
      '#type' => 'file',
    ];
    $form['submit'] = [
      '#type' => 'submit',
      '#value' => $this->t('Import'),
    ];
    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    // Add validator for your file type etc.
    $validators = ['file_validate_extensions' => ['zip']];
    $file = file_save_upload('file', $validators, FALSE, 0);
    if (!$file) {
      return;
    }
    $archiver = \Drupal::service('plugin.manager.archiver')->getInstance(['filepath' => $file->getFileUri()]);
    if (!$archiver) {
      $this->messenger()->addError($this->t('Cannot extract %file, not a valid archive.', ['%file' => $file->getFilename()]));
      return;
    }
    $files = $archiver->listContents();
    $firstFilename = '';
    $exts = [];
    foreach ($files as $file) {
      if (!preg_match('#^[^/]++$#', $file)) {
        $this->messenger()->addError($this->t('There is a problem with the Zipped SHP file you uploaded. The files in the *.zip archive must be directly in the root of the zip file, not in a sub-folder.'));
        return;
      }
      $tokens = explode('.', $file, 2);
      $filename = $tokens[0];
      $ext = $tokens[1];
      if (!$firstFilename) {
        $firstFilename = $filename;
      }
      else {
        if ($filename !== $firstFilename) {
          $this->messenger()->addError($this->t(
            'There is a problem with the Zipped SHP file you uploaded. It should contain a set of files which all share the same file name but having different extensions. The *.zip file you uploaded contained files with different file names, such as @first and @second, so it appears to contain several SHP file sets and therefore cannot be imported.',
            ['@first' => $firstFilename, '@second' => $filename]
          ));
          return;
        }
      }
      $exts[] = strtolower($ext);
      $extsUppercase = strtolower($ext) !== $ext;
    }
    if (!in_array('dbf', $exts) || !in_array('shp', $exts)) {
      $this->messenger()->addError($this->t('There is a problem with the Zipped SHP file you uploaded. The *.zip file must contain at least a *.shp and *.dbf file in order to be imported as a valid SHP file set.'));
      return;
    }
    $directory = uniqid('', TRUE);
    $archiver->extract("public://locations_shp_importer/$directory");
    $form_state->setRedirect('locations_shp_importer.import_options', [
      'path' => $directory,
      'file' => $firstFilename,
      'extscase' => $extsUppercase ? 'upper' : 'lower',
    ]);
  }

}
