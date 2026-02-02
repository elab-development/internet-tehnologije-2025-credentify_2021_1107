<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserCredentialResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,

            'status' => $this->status,
            'applied_date' => optional($this->applied_date)->toDateString(),
            'issued_date' => optional($this->issued_date)->toDateString(),
            'expiry_date' => optional($this->expiry_date)->toDateString(),
            'image' => $this->image,

            'credential' => new CredentialResource($this->whenLoaded('credential')),
        ];
    }
}
