<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Credential extends Model
{
    protected $fillable = [
        'issuer_id',
        'name',
        'category',
        'validity_months',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'validity_months' => 'integer',
    ];

    public function issuer(): BelongsTo
    {
        return $this->belongsTo(Issuer::class);
    }

    public function userCredentials(): HasMany
    {
        return $this->hasMany(UserCredential::class);
    }

    public function skills(): BelongsToMany
    {
        return $this->belongsToMany(Skill::class, 'credential_skill')
            ->withTimestamps();
    }
}
