<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use PHPOpenSourceSaver\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'firstname',
        'lastname',
        'email',
        'password',
        'is_trainer',
        'info',
        'phone',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'is_trainer' => 'boolean',
    ];

    /**
     * A trainer can own many courses.
     */
    public function courses(): HasMany
    {
        return $this->hasMany(Course::class, 'trainer_id');
    }

    /**
     * A participant can have many bookings.
     */
    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    /* ---- auth JWT ---- */
    /**
     * Return the identifier stored in the JWT subject claim.
     * (for example user-id in this token)
     */
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    /**
     * Return custom claims that should be added to the JWT.
     */
    public function getJWTCustomClaims(): array
    {
        return [
            'user' => [
                'id' => $this->id,
                'is_trainer' => $this->is_trainer,
            ],
        ];
    }
}
