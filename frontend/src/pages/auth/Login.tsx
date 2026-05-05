// src/pages/auth/Login.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import type { UserRole } from '../../services/types/auth';
import fondoLogin from '../../assets/fondo_login.png';

const dashboardByRole: Record<UserRole, string> = {
  administrador: '/admin/dashboard',
  recepcionista: '/recepcionista/dashboard',
  groomer: '/groomer/dashboard',
  cliente: '/cliente/dashboard',
};

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const user = await login({ email, password });
      navigate(dashboardByRole[user.rol], { replace: true });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* NAVBAR */}
      <nav style={styles.navbar}>
        <span style={styles.navLogo}>PetSpa</span>
        <div style={styles.navLinks}>
          <Link to="/register" style={styles.navButton}>Registrate</Link>
        </div>
      </nav>

      {/* CARD */}
      <div style={styles.card}>
        <h2 style={styles.title}>Login</h2>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputWrapper}>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              style={styles.input}
            />
            <span style={styles.inputIcon}>✉</span>
          </div>

          <div style={styles.inputWrapper}>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              style={styles.input}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={styles.eyeBtn}
              aria-label="Toggle password"
            >
              {showPassword ? '🔓' : '🔒'}
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={styles.submitBtn}
          >
            {isLoading ? 'Iniciando sesión...' : 'Login'}
          </button>
        </form>

        <div style={styles.footerText}>
          ¿No tienes una cuenta?{' '}
          <Link to="/register" style={styles.footerLink}>Registrate</Link>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    backgroundImage: `url(${fondoLogin})`,  // ← usa la variable importada
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  navbar: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '18px 48px',
    zIndex: 100,
  },
  navLogo: {
    color: '#ffffff',
    fontWeight: 700,
    fontSize: '20px',
    letterSpacing: '0.5px',
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '32px',
  },
  navLink: {
    color: '#d0e4f7',
    textDecoration: 'none',
    fontSize: '14px',
    letterSpacing: '0.3px',
    transition: 'color 0.2s',
  },
  navButton: {
    color: '#000000',
    textDecoration: 'none',
    fontSize: '14px',
    border: '1.5px solid #000000',
    padding: '6px 22px',
    borderRadius: '20px',
    letterSpacing: '0.3px',
    transition: 'background 0.2s',
  },
  card: {
    background: 'rgba(180, 210, 240, 0.18)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(0,0,0,0.25)',
    borderRadius: '16px',
    padding: '40px 36px',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
  },
  title: {
    color: '#000000',
    fontSize: '28px',
    fontWeight: 600,
    textAlign: 'center',
    margin: '0 0 28px 0',
    letterSpacing: '0.5px',
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
    padding: '10px 36px 10px 0',
    outline: 'none',
    boxSizing: 'border-box',
    caretColor: '#ffffff',
  },
  inputIcon: {
    position: 'absolute',
    right: '4px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'rgba(255,255,255,0.7)',
    fontSize: '14px',
    pointerEvents: 'none',
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
    marginTop: '12px',
    background: '#1a1a2e',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    padding: '12px',
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
    letterSpacing: '0.5px',
    transition: 'background 0.2s',
    width: '100%',
  },
  footerText: {
    marginTop: '20px',
    textAlign: 'center',
    fontSize: '13px',
    color: 'rgba(255,255,255,0.75)',
  },
  footerLink: {
    color: '#7ec8f5',
    fontWeight: 600,
    textDecoration: 'none',
  },
  errorBox: {
    background: 'rgba(220,53,69,0.25)',
    border: '1px solid rgba(220,53,69,0.5)',
    color: '#ffb3bb',
    borderRadius: '8px',
    padding: '10px 14px',
    fontSize: '13px',
    marginBottom: '12px',
  },
};