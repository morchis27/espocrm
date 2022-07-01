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


    public function getActionTest()
    {
        $filename = md5(rand(0, 100));
        $client = $this->authenticateClient();
        $phpWord = new PhpWord();
        $section = $phpWord->addSection();
        $section->addText(
            '"Learn from yesterday, live for today, hope for tomorrow. '
            . 'The important thing is not to stop questioning." '
            . '(Albert Einstein)'
        );
        $objWriter = \PhpOffice\PhpWord\IOFactory::createWriter($phpWord, 'Word2007');
        try {
            $objWriter->save('custom/Espo/Custom/Controllers/' . $filename . ".docx");
        } catch (\Throwable $exception) {
            echo $exception->getMessage();
            die();
        }
    }

    public function authenticateClient()
    {
        $client = new EspoApiClient('http://espo.loc');
        $client->setApiKey('542d2865a09f63c81a46c6cb667a64ab');
        $client->setSecretKey('0867e43768888595787ba98845c3de7d');
        return $client;
    }
}
