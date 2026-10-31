<?php

declare(strict_types=1);

namespace Plan2net\FormOptionsCsv\Tests\Unit\Service;

use PHPUnit\Framework\Attributes\Test;
use Plan2net\FormOptionsCsv\Service\OptionsImporter;
use TYPO3\TestingFramework\Core\Unit\UnitTestCase;

final class OptionsImporterTest extends UnitTestCase
{
    #[Test]
    public function importsTheFiveReadmeLinesIntoASingleSelect(): void
    {
        $formDefinition = [
            'renderables' => [
                [
                    'type' => 'Page',
                    'renderables' => [
                        [
                            'type' => 'SingleSelect',
                            'properties' => [
                                'options' => ['old' => 'Old option'],
                                'options_import' => "Label 1;1;1\nLabel 2;2\nLabel 3\nLabel 4;;1\n\"Label with ; works too\";5;1",
                            ],
                        ],
                    ],
                ],
            ],
        ];

        $element = (new OptionsImporter())->importInto($formDefinition)['renderables'][0]['renderables'][0];

        self::assertSame(
            [
                '1' => 'Label 1',
                '2' => 'Label 2',
                'Label 3' => 'Label 3',
                'Label 4' => 'Label 4',
                '5' => 'Label with ; works too',
            ],
            $element['properties']['options']
        );
        self::assertSame(1, $element['defaultValue']);
    }

    #[Test]
    public function windowsLineEndingsLeaveNoCarriageReturnInValues(): void
    {
        $element = $this->importSingleElement('MultiSelect', "Label 1;1;1\r\nLabel 2;2\r\nLabel 3\r\n");

        self::assertSame(['1' => 'Label 1', '2' => 'Label 2', 'Label 3' => 'Label 3'], $element['properties']['options']);
        self::assertSame([1], $element['defaultValue']);
    }

    #[Test]
    public function importsAnElementInsideNestedFieldsets(): void
    {
        $formDefinition = [
            'renderables' => [
                [
                    'type' => 'Page',
                    'renderables' => [
                        [
                            'type' => 'Fieldset',
                            'renderables' => [
                                [
                                    'type' => 'Fieldset',
                                    'renderables' => [
                                        ['type' => 'RadioButton', 'properties' => ['options_import' => 'Yes;y']],
                                    ],
                                ],
                            ],
                        ],
                    ],
                ],
            ],
        ];

        $result = (new OptionsImporter())->importInto($formDefinition);

        self::assertSame(
            ['y' => 'Yes'],
            $result['renderables'][0]['renderables'][0]['renderables'][0]['renderables'][0]['properties']['options']
        );
    }

    #[Test]
    public function importsAnElementInsideAGridColumn(): void
    {
        $formDefinition = [
            'renderables' => [
                [
                    'type' => 'Page',
                    'renderables' => [
                        [
                            'type' => 'GridRow',
                            'renderables' => [
                                [
                                    'type' => 'GridColumn',
                                    'renderables' => [
                                        ['type' => 'MultiCheckbox', 'properties' => ['options_import' => 'Yes;y']],
                                    ],
                                ],
                            ],
                        ],
                    ],
                ],
            ],
        ];

        $result = (new OptionsImporter())->importInto($formDefinition);

        self::assertSame(
            ['y' => 'Yes'],
            $result['renderables'][0]['renderables'][0]['renderables'][0]['renderables'][0]['properties']['options']
        );
    }

    #[Test]
    public function radioButtonKeepsOnlyTheFirstDefault(): void
    {
        $element = $this->importSingleElement('RadioButton', "A;a;1\nB;b;1");

        self::assertSame('a', $element['defaultValue']);
    }

    #[Test]
    public function multiCheckboxKeepsEveryDefault(): void
    {
        $element = $this->importSingleElement('MultiCheckbox', "A;a;1\nB;b\nC;c;1");

        self::assertSame(['a', 'c'], $element['defaultValue']);
    }

    #[Test]
    public function duplicateValueKeepsTheFirstLabel(): void
    {
        $element = $this->importSingleElement('SingleSelect', "First;x\nSecond;x");

        self::assertSame(['x' => 'First'], $element['properties']['options']);
    }

    #[Test]
    public function leavesNonChoiceElementsUntouched(): void
    {
        $element = $this->importSingleElement('Text', 'A;a');

        self::assertSame(['options_import' => 'A;a'], $element['properties']);
        self::assertArrayNotHasKey('defaultValue', $element);
    }

    #[Test]
    public function removesTheImportFieldAfterImport(): void
    {
        $element = $this->importSingleElement('SingleSelect', 'A;a');

        self::assertArrayNotHasKey('options_import', $element['properties']);
    }

    #[Test]
    public function keepsWhitespaceAroundColumns(): void
    {
        $element = $this->importSingleElement('SingleSelect', '  Label ; 1 ');

        self::assertSame([' 1 ' => '  Label '], $element['properties']['options']);
    }

    #[Test]
    public function rowWithFourColumnsUsesTheFirstThree(): void
    {
        $element = $this->importSingleElement('SingleSelect', 'Label;value;1;extra');

        self::assertSame(['value' => 'Label'], $element['properties']['options']);
        self::assertSame('value', $element['defaultValue']);
    }

    #[Test]
    public function rowsPastedFromASpreadsheetAreSplitOnTabs(): void
    {
        $element = $this->importSingleElement('MultiSelect', "Vienna; Austria\tvie\t1\nGraz\tgrz");

        self::assertSame(['vie' => 'Vienna; Austria', 'grz' => 'Graz'], $element['properties']['options']);
        self::assertSame(['vie'], $element['defaultValue']);
    }

    private function importSingleElement(string $type, string $optionsImport): array
    {
        $formDefinition = [
            'renderables' => [
                [
                    'type' => 'Page',
                    'renderables' => [
                        ['type' => $type, 'properties' => ['options_import' => $optionsImport]],
                    ],
                ],
            ],
        ];

        return (new OptionsImporter())->importInto($formDefinition)['renderables'][0]['renderables'][0];
    }
}
