# Changelog

## 3.0.0

### Breaking

- TYPO3 11.5 is no longer supported. Requires TYPO3 12.4, 13.4 or 14.3.
- Requires PHP 8.2 or newer.
- The import textarea is replaced by an "Import from spreadsheet/CSV…" button that opens a modal. The rows are added in the browser, without saving the form first.
- Imported options are now added below the existing options. A switch in the modal replaces them instead.
- The `options_import` property is no longer used and is ignored if a form still contains it.
- Rows with four or more columns now use the first three columns. Before, such a row used column one as both label and value.

### Added

- Paste cells copied from Excel, Google Sheets, LibreOffice or Numbers.
- Drop or choose a CSV file. Tab, `;` and `,` files work, in UTF-8, UTF-16 or the older Windows encoding.
- A preview shows every row, and why a row is skipped, before anything changes.
- A switch for a header row.
- The editor undo button reverts an import in one step.
- German translation.

### Fixed

- Options are imported for elements inside fieldsets and grid rows (#3).
- Defaults with number values are stored as numbers, so the form editor shows them as selected.
