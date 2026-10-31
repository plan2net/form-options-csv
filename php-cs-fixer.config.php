<?php

declare(strict_types=1);

$config = \TYPO3\CodingStandards\CsFixerConfig::create();
$config->addRules([
    'ordered_class_elements' => [
        'order' => ['use_trait', 'case', 'constant_public', 'constant_protected', 'constant_private', 'property_public', 'property_protected', 'property_private', 'construct', 'method_public', 'method_protected', 'method_private'],
    ],
]);
$config->getFinder()
    ->in(__DIR__)
    ->exclude(['.Build', '.ddev', 'vendor']);

return $config;
