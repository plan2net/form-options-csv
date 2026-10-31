<?php

$EM_CONF[$_EXTKEY] = [
    'title' => 'Form options CSV import',
    'description' => 'Import options for TYPO3 form select fields from a spreadsheet or CSV file',
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
