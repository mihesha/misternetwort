<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Setting extends Model
{
    use HasFactory;
    
    protected $fillable = ['key', 'value', 'type', 'description'];
    
    public static function getValue($key, $default = null)
    {
        $setting = self::where('key', $key)->first();
        if (!$setting) return $default;
        
        if ($setting->type === 'number') return (float) $setting->value;
        if ($setting->type === 'boolean') return filter_var($setting->value, FILTER_VALIDATE_BOOLEAN);
        if ($setting->type === 'json') return json_decode($setting->value, true);
        
        return $setting->value;
    }
}
