// src/pages/auth/ActivateAccount.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../../services/auth/authService';
import fondoLogin from '../../assets/fondo_login.png';

type ActivationResult = { email: string; message: string };

const activationRequests = new Map<string, Promise<ActivationResult>>();

const activateOnce = (token: string) => {
  const existingRequest = activationRequests.get(token);
  if (existingRequest) return existingRequest;

  const request = authService.activateAccount(token).catch((error) => {
    activationRequests.delete(token);
    throw error;
  });

  activationRequests.set(token, request);
  return request;
};

export const ActivateAccount = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    let isCurrent = true;
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      setMessage('Token de activación no encontrado');
      return;
    }

    activateOnce(token)
      .then((data) => {
        if (!isCurrent) return;
        setEmail(data.email);
        setStatus('success');
        setMessage(data.message);
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              message: '✅ Cuenta activada exitosamente. Ahora puedes iniciar sesión.' 
            } 
          });
        }, 3000);
      })
      .catch((error) => {
        if (!isCurrent) return;
        setStatus('error');
        setMessage(error.message || 'Error al activar la cuenta. El enlace pudo haber expirado.');
      });

    return () => {
      isCurrent = false;
    };
  }, [searchParams, navigate]);

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {status === 'loading' && (
          <>
            <div style={styles.spinner}></div>
            <h2 style={styles.title}>Activando cuenta...</h2>
            <p style={styles.subtitle}>Por favor espera un momento</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div style={styles.successIcon}>✓</div>
            <h2 style={styles.title}>¡Cuenta activada!</h2>
            <p style={styles.subtitle}>{message}</p>
            <p style={styles.infoText}>Serás redirigido al login en unos segundos...</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div style={styles.errorIcon}>!</div>
            <h2 style={styles.title}>Error de activación</h2>
            <p style={styles.subtitle}>{message}</p>
            <button
              onClick={() => navigate('/login')}
              style={styles.button}
            >
              Ir al Login
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundImage: `url(${fondoLogin})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  card: {
    background: 'rgba(180, 210, 240, 0.18)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(0,0,0,0.25)',
    borderRadius: '16px',
    padding: '40px 36px',
    width: '100%',
    maxWidth: '420px',
    textAlign: 'center',
  },
  title: {
    color: '#000000',
    fontSize: '24px',
    fontWeight: 600,
    margin: '20px 0 8px 0',
  },
  subtitle: {
    color: 'rgba(0,0,0,0.65)',
    fontSize: '14px',
    margin: 0,
  },
  infoText: {
    color: 'rgba(0,0,0,0.5)',
    fontSize: '12px',
    marginTop: '16px',
  },
  spinner: {
    width: '48px',
    height: '48px',
    border: '3px solid rgba(0,0,0,0.1)',
    borderTopColor: '#2563eb',
    borderRadius: '50%',
    margin: '0 auto',
    animation: 'spin 1s linear infinite',
  },
  successIcon: {
    width: '64px',
    height: '64px',
    backgroundColor: '#22c55e',
    color: 'white',
    borderRadius: '50%',
    fontSize: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto',
  },
  errorIcon: {
    width: '64px',
    height: '64px',
    backgroundColor: '#ef4444',
    color: 'white',
    borderRadius: '50%',
    fontSize: '40px',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto',
  },
  button: {
    background: '#1a1a2e',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    padding: '12px 24px',
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: '20px',
    width: '100%',
  },
};

// Agregar al index.css:
// @keyframes spin { to { transform: rotate(360deg); } }
