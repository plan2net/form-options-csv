<?php

$EM_CONF[$_EXTKEY] = array(
    'title' => 'Form options CSV import',
    'description' => 'Import CSV data for core form extension select options',
    'category' => 'backend',
    'author' => 'Wolfgang Klinger',
    'author_email' => 'wk@plan2.net',
    'dependencies' => '',
    'conflicts' => '',
    'priority' => '',
    'module' => '',
    'state' => 'stable',
    'internal' => '',
    'uploadfolder' => 0,
    'createDirs' => '',
    'modify_tables' => '',
    'clearCacheOnLoad' => 1,
    'lockType' => '',
    'author_company' => 'plan2net GmbH',
    'version' => '1.2.0',
    'constraints' => array(
        'depends' => array(
            'typo3' => '8.7.19-9.5.99',
            'form' => '*',
        ),
        'conflicts' => array(
        ),
        'suggests' => array(
        ),
    ),
    'suggests' => array(
    ),
);
