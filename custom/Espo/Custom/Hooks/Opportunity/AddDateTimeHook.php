<?php

namespace Espo\Custom\Hooks\Opportunity;

use Espo\ORM\Entity;

class AddDateTimeHook
{
    public function beforeSave(Entity $opportunity, array $options, array $data)
    {
        $name = $opportunity->get("name");
        if ($opportunity->isNew())
            $opportunity->set("name", $this->formatedName($name));
    }

    private function formatedName($name)
    {
        return $name . ", " . date("d.m.Y H:i:s");
    }
}
