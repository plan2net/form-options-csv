# Import CSV data for form select options

## What does it do?

The extension adds an import field to these form elements:

* Single select
* Multi select
* Multi checkbox
* Radio button

These are all elements with a _Choices_ field.

![Backend form](Documentation/Images/backend_form_import.png)

Paste your options into the import field and save the element. Each line becomes one _Choices_ row. The example data below gives this result:

![Backend form after import](Documentation/Images/backend_form_imported.png)

**The import replaces all existing options of the element.** After saving, the import field is empty again.

## Supported versions

| Extension | TYPO3                | PHP        |
|-----------|----------------------|------------|
| 3.x       | 12.4, 13.4, 14.3 LTS | 8.2 to 8.5 |

Only these LTS versions are tested and supported. For TYPO3 11.5, use version 2.x.

## Installation

    composer require "plan2net/form-options-csv"

## Format of the import field

Each line has up to three columns, separated by `;`:

    label;value;default

* **label**: the text the visitor sees. Required.
* **value**: the value that is submitted. Optional. If it is missing or empty, the label is used.
* **default**: marks the option as selected by default. Leave it empty or use `0` for "no". Anything else means "yes".

Columns after the third are ignored. Empty lines are skipped.

### Example

    Label 1;1;1
    Label 2;2
    Label 3
    Label 4;;1
    "Label with ; works too";5;1

* `Label 1;1;1`: label "Label 1", value "1", selected by default.
* `Label 2;2`: label "Label 2", value "2".
* `Label 3`: label and value are "Label 3".
* `Label 4;;1`: label and value are "Label 4", selected by default.
* `"Label with ; works too";5;1`: put a label in double quotes (`""`) to use `;` inside it.

### Default values

* Single select and radio button can have only one default. The first marked line wins, and later marks are ignored.
* Multi select and multi checkbox keep every marked line as a default.

### Same value twice

If two lines have the same value, only the first line is kept.

### Paste from a spreadsheet

You can copy rows from a spreadsheet (Excel, LibreOffice, Google Sheets, Numbers) and paste them. Pasted cells are separated by tabs, and the import handles that. If a line has a tab, the tab separates the columns and `;` is just text.

### Fieldsets and grids

The import works for elements at any depth, including fieldsets and grid rows.
