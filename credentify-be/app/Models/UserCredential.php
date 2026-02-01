<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserCredential extends Model
{
    public const STATUS_PENDING  = 'Pending';
    public const STATUS_APPROVED = 'Approved';
    public const STATUS_REJECTED = 'Rejected';
    public const STATUS_EXPIRED  = 'Expired';

    protected $fillable = [
        'user_id',
        'credential_id',
        'status',
        'applied_date',
        'issued_date',
        'expiry_date',
        'image',
    ];

    protected $casts = [
        'applied_date' => 'date',
        'issued_date'  => 'date',
        'expiry_date'  => 'date',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function credential(): BelongsTo
    {
        return $this->belongsTo(Credential::class);
    }
}
