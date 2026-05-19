import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { FiLock, FiEye, FiEyeOff, FiArrowLeft } from 'react-icons/fi';
import { authService } from '../../services/auth/authService';
import { PasswordStrengthMeter } from '../../components/common/PasswordStrengthMeter';
import fondoLogin from '../../assets/fondo_login.png';

export const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    const emailParam = searchParams.get('email');

    if (!tokenParam || !emailParam) {
      setError('Enlace inválido o incompleto');
    } else {
      setToken(tokenParam);
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword(email, token, password, confirmPassword);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
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
          <div style={styles.successIcon}>✅</div>
          <h2 style={styles.title}>¡Contraseña restablecida!</h2>
          <p style={styles.subtitle}>
            Tu contraseña ha sido actualizada correctamente.
          </p>
          <p style={styles.note}>
            Serás redirigido al inicio de sesión en unos segundos...
          </p>
          <Link to="/login" style={styles.backLink}>
            Ir al inicio de sesión
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

        <h2 style={styles.title}>Crear nueva contraseña</h2>
        <p style={styles.subtitle}>
          Ingresa tu nueva contraseña. Debe ser segura y fácil de recordar.
        </p>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.passwordWrapper}>
            <div style={styles.inputWrapper}>
              <FiLock style={styles.inputIcon} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nueva contraseña"
                required
                style={styles.input}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
            {password && (
              <div style={styles.strengthMeterContainer}>
                <PasswordStrengthMeter password={password} />
              </div>
            )}
          </div>

          <div style={styles.inputWrapper}>
            <FiLock style={styles.inputIcon} />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirmar contraseña"
              required
              style={styles.input}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.eyeBtn}
            >
              {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={styles.submitBtn}
          >
            {isLoading ? 'Guardando...' : 'Restablecer contraseña'}
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
    gap: '16px',
  },
  inputWrapper: {
    position: 'relative',
    width: '100%',
  },
  passwordWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  input: {
    width: '100%',
    background: 'transparent',
    border: 'none',
    borderBottom: '1.5px solid rgba(0,0,0,0.6)',
    color: '#000000',
    fontSize: '14px',
    padding: '10px 28px 10px 32px',
    outline: 'none',
  },
  inputIcon: {
    position: 'absolute',
    left: '0',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'rgba(0,0,0,0.5)',
  },
  eyeBtn: {
    position: 'absolute',
    right: '0',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    color: 'rgba(0,0,0,0.5)',
  },
  strengthMeterContainer: {
    marginTop: '8px',
    marginBottom: '4px',
  },
  submitBtn: {
    marginTop: '10px',
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