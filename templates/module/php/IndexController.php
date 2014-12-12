<?php

class {{moduleName|capitilize}}_IndexController extends IA_Controller
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
