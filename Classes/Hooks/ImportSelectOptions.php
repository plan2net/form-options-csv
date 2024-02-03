<?php
declare(strict_types=1);

namespace Plan2net\FormOptionsCsv\Hooks;

use TYPO3\CMS\Extbase\Utility\DebuggerUtility;

class ImportSelectOptions
{

    public function beforeFormSave(string $formPersistenceIdentifier, array $formDefinition): array
    {
        if (\is_array($formDefinition['renderables'])) {
            $formDefinition['renderables'] = $this->parsePages($formDefinition['renderables']);
        }
        return $formDefinition;
    }

    protected function parsePages(array $pages): array
    {
        foreach ($pages as $key => $page) {
            if (\is_array($page['renderables'])) {
                $pages[$key]['renderables'] = $this->parseElements($page['renderables']);
            }
        }

        return $pages;
    }

    protected function parseElements($elements): array
    {
        foreach ($elements as $key => $element) {
            if (!empty($element['properties']['options_import']
                && in_array($element['type'], ['MultiSelect', 'SingleSelect', 'MultiCheckbox', 'RadioButton'], true))) {
                $elements[$key] = $this->importOptions($element);
            }
        }

        return $elements;
    }

    protected function importOptions(array $element): array
    {
        // clear set options
        $element['properties']['options'] = [];
        $element['defaultValue'] = [];
        $defaultValueSet = false;
        foreach (explode("\n", $element['properties']['options_import']) as $line) {
            if (trim($line)) {
                $parts = str_getcsv($line, ';');
                switch (\count($parts)) {
                    // full definition of <label>;<value>;<0|1> (set as default value)
                    case 3:
                        if (trim($parts[1]) === '') {
                            $parts[1] = $parts[0];
                        }
                        $element['properties']['options'] += [
                            (string)$parts[1] => $parts[0]
                        ];
                        if ((bool)$parts[2] === true) {
                            if ($element['type'] === 'SingleSelect'
                                || $element['type'] === 'RadioButton') {
                                if (!$defaultValueSet) {
                                    $element['defaultValue'] = $parts[1];
                                    $defaultValueSet = true;
                                }
                            } else {
                                $element['defaultValue'][] = $parts[1];
                            }
                        }
                        break;
                    // only <label>;<value> given, no default option
                    case 2:
                        $element['properties']['options'] += [
                            (string)$parts[1] => $parts[0]
                        ];
                        break;
                    // only <label> given, set <value> to value of <label>
                    default:
                        $element['properties']['options'] += [
                            (string)$parts[0] => $parts[0]
                        ];
                }
            }
        }
        unset($element['properties']['options_import']);

        return $element;
    }

}
