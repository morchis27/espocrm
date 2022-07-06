<?php

namespace Espo\Custom\Controllers;

use Espo\Core\Api\Request;
use Espo\Entities\Attachment;
use Espo\ORM\EntityManager;
use PhpOffice\PhpWord\IOFactory;
use PhpOffice\PhpWord\PhpWord;

class OpportunityExtensionController
{
    private EntityManager $entityManager;

    public function __construct(EntityManager $entityManager)
    {
        $this->entityManager = $entityManager;
    }


    public function getActionPrintOpportunityDoc(Request $request)
    {
        $textValue=$request->getRouteParam("opportunityName");
        $attachment = $this->entityManager
            ->getRDBRepository(Attachment::ENTITY_TYPE)
            ->findOne();

        if (is_null($attachment)) {
            $attachment = $this->createAttachmentwithFile($textValue);

        }
        return json_encode(
            [
                'success' => true,
                "id" => $attachment->get("id")
            ]
        );
    }

    private function createAttachmentWithFile(string $textValue)
    {
        $attachment = $this->entityManager->createEntity(Attachment::ENTITY_TYPE,[
            'name' => 'Test.docx',
            'type' => 'application/msword',
            'field' => 'file',
            'storage' => 'EspoUploadDir',
        ]);

        $id = $attachment->get('id');
        $phpWord = new PhpWord();
        $section = $phpWord->addSection();
        $section->addText($textValue);
        $objWriter = IOFactory::createWriter($phpWord);

        try {
            $objWriter->save('data/upload/'. $id);
        } catch (\Throwable $exception) {
            echo $exception->getMessage();
        }

        return $attachment;
    }
}
