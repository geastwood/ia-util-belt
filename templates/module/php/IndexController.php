<?php

class {{moduleName|capitalize}}_IndexController extends IA_Controller
{

    /**
     * @requiresClient
     * @noAgency
     */
    public function indexAction()
    {
        $idString = $this->getIdString();

        $this->_setJsParams(
            array(
                 'idstring' => $idString
            )
        );

    }
}
