<?php
declare(strict_types=1);

namespace Plan2net\FormOptionsCsv\Hooks;

/**
 * Class ImportSelectOptions
 * @package Plan2net\FormOptionsCsv\Hooks
 * @author Wolfgang Klinger <wk@plan2.net>
 */
class ImportSelectOptions
{

    /**
     * @param string $formPersistenceIdentifier
     * @param array $formDefinition
     * @return array
     */
    public function beforeFormSave(string $formPersistenceIdentifier, array $formDefinition): array
    {
        if (\is_array($formDefinition['renderables'])) {
            $formDefinition['renderables'] = $this->parsePages($formDefinition['renderables']);
        }

        return $formDefinition;
    }

    /**
     * @param array $pages
     * @return array
     */
    protected function parsePages(array $pages): array
    {
        foreach ($pages as $key => $page) {
            if (\is_array($page['renderables'])) {
                $pages[$key]['renderables'] = $this->parseElements($page['renderables']);
            }
        }

        return $pages;
    }

    /**
     * @param array $elements
     * @return array
     */
    protected function parseElements($elements): array
    {
        foreach ($elements as $key => $element) {
            if (!empty($element['properties']['options_import']
                && ($element['type'] === 'MultiSelect'
                    || $element['type'] === 'SingleSelect'
                    || $element['type'] === 'MultiCheckbox'
                    || $element['type'] === 'RadioButton'))) {
                $elements[$key] = $this->importOptions($element);
            }
        }

        return $elements;
    }

    /**
     * @param array $element
     * @return array
     */
    protected function importOptions($element): array
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
