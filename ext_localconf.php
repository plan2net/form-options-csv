<?php

declare(strict_types=1);

use Plan2net\FormOptionsCsv\Hooks\BeforeFormSaveHook;
use TYPO3\CMS\Core\Information\Typo3Version;
use TYPO3\CMS\Core\Utility\ExtensionManagementUtility;

(static function (): void {
    $typo3Version = (new Typo3Version())->getVersion();
    if (version_compare($typo3Version, '14.0.0', '<')) {
        $GLOBALS['TYPO3_CONF_VARS']['SC_OPTIONS']['ext/form']['beforeFormSave'][] = BeforeFormSaveHook::class;
    }
    // TYPO3 14.2 and later load the form setup by themselves.
    if (version_compare($typo3Version, '14.2.0', '<')) {
        ExtensionManagementUtility::addTypoScriptSetup(
            'module.tx_form.settings.yamlConfigurations.1604589938 = EXT:form_options_csv/Configuration/Form/FormOptionsCsv/config.yaml'
        );
    }
})();
