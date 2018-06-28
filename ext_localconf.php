<?php

defined('TYPO3_MODE') or die();

(function () {
    if (TYPO3_MODE === 'BE') {
        $GLOBALS['TYPO3_CONF_VARS']['SYS']['Objects'][\TYPO3\CMS\Form\Controller\FormEditorController::class] = [
            'className' => \Plan2net\FormOptionsCsv\Controller\FormEditorController::class
        ];
        $GLOBALS['TYPO3_CONF_VARS']['SC_OPTIONS']['ext/form']['beforeFormSave'][] = \Plan2net\FormOptionsCsv\Hooks\ImportSelectOptions::class;
    }
})();
