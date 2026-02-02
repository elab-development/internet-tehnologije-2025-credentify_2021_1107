<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CredentialResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'category' => $this->category,
            'validity_months' => $this->validity_months,
            'is_active' => (bool) $this->is_active,

            'issuer' => new IssuerResource($this->whenLoaded('issuer')),
            'skills' => SkillResource::collection($this->whenLoaded('skills')),
        ];
    }
}
