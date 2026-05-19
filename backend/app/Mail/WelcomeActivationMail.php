<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class WelcomeActivationMail extends Mailable
{
    use Queueable, SerializesModels;

    public User $user;
    public string $plainPassword;
    public string $activationUrl;

    public function __construct(User $user, string $plainPassword)
    {
        $this->user = $user;
        $this->plainPassword = $plainPassword;
        $token = $user->generateActivationToken();
        $this->activationUrl = env('FRONTEND_URL', 'http://localhost:5173') . '/activar-cuenta?token=' . $token;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Bienvenido a SPA Mascotas - Activa tu cuenta',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.welcome-activation',
        );
    }
}