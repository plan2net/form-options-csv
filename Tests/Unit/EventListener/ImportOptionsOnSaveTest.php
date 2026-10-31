<?php

declare(strict_types=1);

namespace Plan2net\FormOptionsCsv\Tests\Unit\EventListener;

use PHPUnit\Framework\Attributes\Test;
use Plan2net\FormOptionsCsv\EventListener\ImportOptionsOnSave;
use Plan2net\FormOptionsCsv\Service\OptionsImporter;
use TYPO3\CMS\Core\Http\ServerRequest;
use TYPO3\CMS\Form\Event\BeforeFormIsSavedEvent;
use TYPO3\TestingFramework\Core\Unit\UnitTestCase;

final class ImportOptionsOnSaveTest extends UnitTestCase
{
    #[Test]
    public function replacesTheFormDefinitionWithTheImportedOne(): void
    {
        if (!class_exists(BeforeFormIsSavedEvent::class)) {
            self::markTestSkipped('BeforeFormIsSavedEvent exists only in TYPO3 14+.');
        }
        $event = new BeforeFormIsSavedEvent(
            '1:/form_definitions/contact.form.yaml',
            [
                'type' => 'Form',
                'label' => 'Contact',
                'identifier' => 'contact',
                'prototypeName' => 'standard',
                'renderables' => [
                    ['type' => 'Page', 'renderables' => [['type' => 'SingleSelect', 'properties' => ['options_import' => 'A;a']]]],
                ],
            ],
            new ServerRequest()
        );

        (new ImportOptionsOnSave(new OptionsImporter()))($event);

        $renderables = $event->form['renderables'] ?? [];
        self::assertSame(['a' => 'A'], $renderables[0]['renderables'][0]['properties']['options']);
    }
}
