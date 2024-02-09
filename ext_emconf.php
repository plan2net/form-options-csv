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
    'version' => '2.0.0',
    'constraints' => [
        'depends' => [
            'typo3' => '11.5.99',
            'form' => '11.5.99',
        ],
        'conflicts' => [
        ],
        'suggests' => [
        ],
    ],
    'suggests' => [
    ],
];
