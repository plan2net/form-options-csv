<?php

defined('TYPO3_MODE') or die();

(function () {
    if (TYPO3_MODE === 'BE') {

        $typoscript = 'module.tx_form {
    settings {
        yamlConfigurations {
            1604589938 = EXT:form_options_csv/Configuration/Yaml/FormSetup.yaml
        }
    }
}';
        \TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addTypoScriptSetup($typoscript);

        $GLOBALS['TYPO3_CONF_VARS']['SC_OPTIONS']['ext/form']['beforeFormSave'][] = \Plan2net\FormOptionsCsv\Hooks\ImportSelectOptions::class;
    }
})();
