<?php

declare(strict_types=1);

namespace Plan2net\FormOptionsCsv\Service;

final readonly class OptionsImporter
{
    private const SINGLE_VALUE_TYPES = ['SingleSelect', 'RadioButton'];
    private const CHOICE_TYPES = ['SingleSelect', 'MultiSelect', 'MultiCheckbox', 'RadioButton'];

    public function importInto(array $formDefinition): array
    {
        foreach ($formDefinition['renderables'] ?? [] as $key => $renderable) {
            $formDefinition['renderables'][$key] = $this->importInto($renderable);
        }

        return $this->isImportable($formDefinition) ? $this->importOptions($formDefinition) : $formDefinition;
    }

    private function isImportable(array $element): bool
    {
        return in_array($element['type'] ?? null, self::CHOICE_TYPES, true)
            && is_string($element['properties']['options_import'] ?? null)
            && $element['properties']['options_import'] !== '';
    }

    private function importOptions(array $element): array
    {
        $element['properties']['options'] = [];
        $defaultValues = [];

        foreach (explode("\n", $element['properties']['options_import']) as $line) {
            if (trim($line) === '') {
                continue;
            }
            $columns = str_getcsv($line, str_contains($line, "\t") ? "\t" : ';', '"', '');
            $label = $columns[0];
            $value = ($columns[1] ?? '') === '' ? $label : $columns[1];
            $element['properties']['options'] += [$value => $label];

            if ((bool)($columns[2] ?? false)) {
                $defaultValues[] = $value;
            }
        }
        $element['defaultValue'] = in_array($element['type'], self::SINGLE_VALUE_TYPES, true)
            ? ($defaultValues[0] ?? [])
            : $defaultValues;
        unset($element['properties']['options_import']);

        return $element;
    }
}
