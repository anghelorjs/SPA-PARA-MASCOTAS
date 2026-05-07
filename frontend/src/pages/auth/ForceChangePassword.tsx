// src/pages/auth/ForceChangePassword.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { PasswordStrengthMeter } from '../../components/common/PasswordStrengthMeter';
import fondoLogin from '../../assets/fondo_login.png';

export const ForceChangePassword = () => {
  const { forceChangePassword, logout } = useAuth();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setIsLoading(true);
    try {
      await forceChangePassword(newPassword);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Cambio de Contraseña Obligatorio</h2>
        <p style={styles.subtitle}>
          Por seguridad, debes cambiar tu contraseña temporal antes de continuar.
        </p>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputWrapper}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Nueva contraseña"
              required
              style={styles.input}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={styles.eyeBtn}
            >
              {showPassword ? '🔓' : '🔒'}
            </button>
          </div>

          <PasswordStrengthMeter password={newPassword} />

          <div style={styles.inputWrapper}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirmar contraseña"
              required
              style={styles.input}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={styles.submitBtn}
          >
            {isLoading ? 'Guardando...' : 'Actualizar Contraseña'}
          </button>
        </form>

        <div style={styles.logoutContainer}>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            Cerrar sesión
          </button>
        </div>
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
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
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
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
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
    padding: '10px 32px 10px 0',
    outline: 'none',
    boxSizing: 'border-box',
  },
  eyeBtn: {
    position: 'absolute',
    right: '4px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    padding: 0,
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
  logoutContainer: {
    marginTop: '20px',
    textAlign: 'center',
  },
  logoutBtn: {
    background: 'none',
    border: 'none',
    color: '#6b7280',
    fontSize: '13px',
    cursor: 'pointer',
    textDecoration: 'underline',
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
};