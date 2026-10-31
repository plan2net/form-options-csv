<?php

declare(strict_types=1);

namespace Plan2net\FormOptionsCsv\EventListener;

use Plan2net\FormOptionsCsv\Service\OptionsImporter;
use TYPO3\CMS\Core\Attribute\AsEventListener;
use TYPO3\CMS\Form\Event\BeforeFormIsSavedEvent;

#[AsEventListener(identifier: 'form-options-csv/import-options-on-save', event: BeforeFormIsSavedEvent::class)]
final readonly class ImportOptionsOnSave
{
    public function __construct(private OptionsImporter $optionsImporter) {}

    public function __invoke(BeforeFormIsSavedEvent $event): void
    {
        /**
         * @var array{type: string, label: string, identifier: string, prototypeName: string, renderables?: array} $form
         */
        $form = $this->optionsImporter->importInto($event->form);
        $event->form = $form;
    }
}
