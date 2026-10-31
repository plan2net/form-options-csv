<?php

declare(strict_types=1);

namespace Plan2net\FormOptionsCsv\Hooks;

use Plan2net\FormOptionsCsv\Service\OptionsImporter;

final readonly class BeforeFormSaveHook
{
    public function __construct(private OptionsImporter $optionsImporter) {}

    public function beforeFormSave(string $formPersistenceIdentifier, array $formDefinition): array
    {
        return $this->optionsImporter->importInto($formDefinition);
    }
}
