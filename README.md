# Import CSV data for form select options

## Installation

Require via composer `"plan2net/form-options-csv": "1.0.0"`

and activate the extension in the Extension manager.

## Possible values in the import field

    1: Entry 1;1;1
    2: Entry 2;2
    3: Entry 3
    4: Entry 4;;1
    5: "Entry with ; works too";5;1
    
1. Label is set to 'Entry1', value ist set to '1' and the option is selected as default

2. Label is set to 'Entry 2', value is set to '2'

3. Label _and_ value are set to 'Entry 3'

4. Label _and_ value are set to 'Entry 4' and the option is set as default

5. Escape the label with `""` (CSV standard) and you can use `;` in the text too

The import field is cleared after saving the form.

For single select values only the first entry with a selected option is set and ignored for all other entries.

### Core bugfix

This extension includes a Core bugfix that resolves:
https://forge.typo3.org/issues/85416

If this is integrated into the next Core version, the class `\Plan2net\FormOptionsCsv\Controller\FormEditorController` can savely be removed again.
