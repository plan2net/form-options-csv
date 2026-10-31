<?php

declare(strict_types=1);

namespace Plan2net\FormOptionsCsv\Tests\Unit\Hooks;

use PHPUnit\Framework\Attributes\Test;
use Plan2net\FormOptionsCsv\Hooks\BeforeFormSaveHook;
use Plan2net\FormOptionsCsv\Service\OptionsImporter;
use TYPO3\TestingFramework\Core\Unit\UnitTestCase;

final class BeforeFormSaveHookTest extends UnitTestCase
{
    #[Test]
    public function returnsTheImportedFormDefinition(): void
    {
        $formDefinition = [
            'type' => 'Form',
            'renderables' => [
                ['type' => 'Page', 'renderables' => [['type' => 'SingleSelect', 'properties' => ['options_import' => 'A;a']]]],
            ],
        ];

        $result = (new BeforeFormSaveHook(new OptionsImporter()))->beforeFormSave('1:/form_definitions/contact.form.yaml', $formDefinition);

        self::assertSame(['a' => 'A'], $result['renderables'][0]['renderables'][0]['properties']['options']);
    }
}
