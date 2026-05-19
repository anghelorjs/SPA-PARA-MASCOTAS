import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiArrowLeft } from 'react-icons/fi';
import { authService } from '../../services/auth/authService';
import fondoLogin from '../../assets/fondo_login.png';

export const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await authService.forgotPassword(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.successIcon}>📧</div>
          <h2 style={styles.title}>Revisa tu correo</h2>
          <p style={styles.subtitle}>
            Hemos enviado un enlace de restablecimiento a <strong>{email}</strong>
          </p>
          <p style={styles.note}>
            El enlace expirará en 15 minutos. Si no recibes el correo, revisa tu carpeta de spam.
          </p>
          <Link to="/login" style={styles.backLink}>
            ← Volver al inicio de sesión
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <Link to="/login" style={styles.backButton}>
          <FiArrowLeft size={18} /> Volver
        </Link>

        <h2 style={styles.title}>¿Olvidaste tu contraseña?</h2>
        <p style={styles.subtitle}>
          Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
        </p>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputWrapper}>
            <FiMail style={styles.inputIcon} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Correo electrónico"
              required
              style={styles.input}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={styles.submitBtn}
          >
            {isLoading ? 'Enviando...' : 'Enviar enlace'}
          </button>
        </form>
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
    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${fondoLogin})`,
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
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: '20px',
    left: '20px',
    color: 'rgba(0,0,0,0.6)',
    textDecoration: 'none',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  title: {
    color: '#000000',
    fontSize: '24px',
    fontWeight: 600,
    textAlign: 'center',
    margin: '0 0 8px 0',
  },
  subtitle: {
    color: 'rgba(0,0,0,0.65)',
    fontSize: '14px',
    textAlign: 'center',
    marginBottom: '24px',
  },
  note: {
    color: 'rgba(0,0,0,0.5)',
    fontSize: '12px',
    textAlign: 'center',
    marginTop: '16px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    width: '100%',
    background: 'transparent',
    border: 'none',
    borderBottom: '1.5px solid rgba(0,0,0,0.6)',
    color: '#000000',
    fontSize: '14px',
    padding: '10px 0 10px 32px',
    outline: 'none',
  },
  inputIcon: {
    position: 'absolute',
    left: '0',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'rgba(0,0,0,0.5)',
    fontSize: '18px',
  },
  submitBtn: {
    background: '#1a1a2e',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    padding: '12px',
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
    width: '100%',
  },
  errorBox: {
    background: 'rgba(220,53,69,0.25)',
    border: '1px solid rgba(220,53,69,0.5)',
    color: '#ffb3bb',
    borderRadius: '8px',
    padding: '10px 14px',
    fontSize: '13px',
    marginBottom: '16px',
  },
  successIcon: {
    fontSize: '48px',
    textAlign: 'center',
    marginBottom: '16px',
  },
  backLink: {
    display: 'block',
    textAlign: 'center',
    marginTop: '20px',
    color: '#7ec8f5',
    textDecoration: 'none',
  },
};