<?php

namespace Plan2net\FormOptionsCsv\Controller;

use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Form\Domain\Configuration\ConfigurationService;
use TYPO3\CMS\Form\Mvc\Persistence\Exception\PersistenceManagerException;
use TYPO3\CMS\Form\Type\FormDefinitionArray;

/**
 * Class FormEditorController
 * @package Plan2net\FormOptionsCsv\Controller
 * @author Wolfgang Klinger <wk@plan2.net>
 */
class FormEditorController extends \TYPO3\CMS\Form\Controller\FormEditorController
{

    /**
     * Save a formDefinition which was build by the form editor.
     *
     * plan2net Core Bugfix, see
     * https://review.typo3.org/#/c/57406/
     *
     * @param string $formPersistenceIdentifier
     * @param FormDefinitionArray $formDefinition
     */
    public function saveFormAction(string $formPersistenceIdentifier, FormDefinitionArray $formDefinition)
    {
        $formDefinition = $formDefinition->getArrayCopy();
        $formDefinition = $this->filterEmptyArrays($formDefinition);
        if (
            isset($GLOBALS['TYPO3_CONF_VARS']['SC_OPTIONS']['ext/form']['beforeFormSave'])
            && \is_array($GLOBALS['TYPO3_CONF_VARS']['SC_OPTIONS']['ext/form']['beforeFormSave'])
        ) {
            foreach ($GLOBALS['TYPO3_CONF_VARS']['SC_OPTIONS']['ext/form']['beforeFormSave'] as $className) {
                $hookObj = GeneralUtility::makeInstance($className);
                if (method_exists($hookObj, 'beforeFormSave')) {
                    $formDefinition = $hookObj->beforeFormSave(
                        $formPersistenceIdentifier,
                        $formDefinition
                    );
                }
            }
        }

        $response = [
            'status' => 'success',
        ];

        try {
            $this->formPersistenceManager->save($formPersistenceIdentifier, $formDefinition);
        } catch (PersistenceManagerException $e) {
            $response = [
                'status' => 'error',
                'message' => $e->getMessage(),
                'code' => $e->getCode(),
            ];
        }

        // plan2net Bugfix
        $configurationService = $this->objectManager->get(ConfigurationService::class);
        $this->prototypeConfiguration = $configurationService->getPrototypeConfiguration($formDefinition['prototypeName']);
        $formDefinition = $this->transformFormDefinitionForFormEditor($formDefinition);
        //
        $response['formDefinition'] = $formDefinition;

        $this->view->assign('response', $response);
        // saveFormAction uses the extbase JsonView::class.
        // That's why we have to set the view variables in this way.
        $this->view->setVariablesToRender([
            'response',
        ]);
    }


}
