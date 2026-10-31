<?php

declare(strict_types=1);

use TYPO3\CMS\Core\Information\Typo3Version;
use TYPO3\CMS\Core\Utility\ExtensionManagementUtility;

// TYPO3 14.2 and later load the form setup by themselves.
if (version_compare((new Typo3Version())->getVersion(), '14.2.0', '<')) {
    ExtensionManagementUtility::addTypoScriptSetup(
        'module.tx_form.settings.yamlConfigurations.1604589938 = EXT:form_options_csv/Configuration/Form/FormOptionsCsv/config.yaml'
    );
}
