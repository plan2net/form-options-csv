<?php

(static function () {
    $typoscript = 'module.tx_form {
    settings {
        yamlConfigurations {
            1604589938 = EXT:form_options_csv/Configuration/FormSetup.yaml
        }
    }
}';
    \TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addTypoScriptSetup($typoscript);

    if (TYPO3_MODE === 'BE') {
        $GLOBALS['TYPO3_CONF_VARS']['SC_OPTIONS']['ext/form']['beforeFormSave'][] = \Plan2net\FormOptionsCsv\Hooks\ImportSelectOptions::class;
    }
})();
