<?php

$EM_CONF[$_EXTKEY] = [
    'title' => 'Form options CSV import',
    'description' => 'Import CSV data for core form extension select options',
    'category' => 'backend',
    'author' => 'Wolfgang Klinger',
    'author_email' => 'wk@plan2.net',
    'state' => 'stable',
    'clearCacheOnLoad' => true,
    'author_company' => 'plan2net GmbH',
    'version' => '3.0.0',
    'constraints' => [
        'depends' => [
            'php' => '8.2.0-8.5.99',
            'typo3' => '12.4.0-14.9.99',
            'form' => '12.4.0-14.9.99',
        ],
        'conflicts' => [
        ],
        'suggests' => [
        ],
    ],
    'suggests' => [
    ],
];
