# Changelog

## 3.0.0

### Breaking

- TYPO3 11.5 is no longer supported. Requires TYPO3 12.4, 13.4 or 14.3.
- Requires PHP 8.2 or newer.
- Rows with four or more columns now use the first three columns. Before, such a row used column one as both label and value.

### Added

- You can paste rows copied from a spreadsheet. A line with a tab is split on tabs instead of `;`.

### Fixed

- Options are imported for elements inside fieldsets and grid rows (#3).
- No PHP 8.4 deprecation from `str_getcsv`.
