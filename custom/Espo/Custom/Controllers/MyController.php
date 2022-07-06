<?php

namespace Espo\Custom\Controllers;

use Espo\ORM\EntityManager;
use Espo\Custom\EspoApiClient;
use Espo\Modules\Crm\Services\Document;
use PhpOffice\PhpWord\PhpWord;

class MyController
{
    private EntityManager $entityManager;

    public function __construct(EntityManager $entityManager)
    {
        $this->entityManager = $entityManager;
    }


    public function getActionPrintOpportunityDoc()
    {
        $filename="HelloWorld.docx";
        $phpWord = new PhpWord();
        $section = $phpWord->addSection();
        $section->addText(
            'text'
        );
        header("Content-Description: File Transfer");
        header('Content-Disposition: attachment; filename="' . $filename . '"');
        header('Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        header('Content-Transfer-Encoding: binary');
        header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
        header('Expires: 0');
        $objWriter = \PhpOffice\PhpWord\IOFactory::createWriter($phpWord, 'Word2007');
        try {
            $objWriter->save("php://output");
        } catch (\Throwable $exception) {
            echo $exception->getMessage();
            die();
        }
    }
}
