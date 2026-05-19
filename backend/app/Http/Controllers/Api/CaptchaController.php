<?php

namespace App\Http\Controllers\Api;

use Gregwar\Captcha\CaptchaBuilder;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class CaptchaController extends ApiController
{
    public function generate()
    {
        $builder = new CaptchaBuilder();
        $builder->build(120, 40);
        
        $captchaId = Str::random(32);
        $phrase = $builder->getPhrase();
        
        Cache::put('captcha_' . $captchaId, strtolower($phrase), 300);
        
        return response()->json([
            'captcha_id' => $captchaId,
            'image' => base64_encode($builder->get())
        ]);
    }
    
    public function validateCaptcha($captchaId, $captchaInput)
    {
        $storedPhrase = Cache::get('captcha_' . $captchaId);
        Cache::forget('captcha_' . $captchaId);
        return $storedPhrase && strtolower($captchaInput) === $storedPhrase;
    }
}