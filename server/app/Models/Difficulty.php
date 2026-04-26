<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Difficulty extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
    ];

    /**
     * One difficulty level can be used by many courses.
     */
    public function courses(): HasMany
    {
        return $this->hasMany(Course::class);
    }
}
