// src/pages/auth/Login.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../../hooks/useAuth';
import type { UserRole } from '../../services/types/auth';
import fondoLogin from '../../assets/fondo_login.png';
import { authService } from '../../services/auth/authService';
import { CaptchaInput } from '../../components/common/CaptchaInput';

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
  const [captcha, setCaptcha] = useState('');
  const [captchaError, setCaptchaError] = useState('');
  const handleGoogleLogin = () => {
    authService.loginWithGoogle();
  };
  const [captchaId, setCaptchaId] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCaptchaError('');
    setIsLoading(true);
    try {
      const response = await login({ 
        email, 
        password, 
        captcha_id: captchaId,  // ← Enviar captcha_id
        captcha                  // ← Enviar captcha
      });
      
      if (response.must_change_password) {
        navigate('/force-change-password', { replace: true });
      } else {
        navigate(dashboardByRole[response.user.rol], { replace: true });
      }
    } catch (err: any) {
      if (err.message.toLowerCase().includes('captcha')) {
        setCaptchaError(err.message);
      } else {
        setError(err.message);
      }
      // Recargar captcha
      const refreshBtn = document.querySelector('[title="Recargar captcha"]') as HTMLButtonElement;
      refreshBtn?.click();
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div style={styles.page}>
      <nav style={styles.navbar}>
        <span style={styles.navLogo}>PetSpa</span>
        <div style={styles.navLinks}>
          <Link to="/register" style={styles.navButton}>Registrate</Link>
        </div>
      </nav>

      <div style={styles.card}>
        <h2 style={styles.title}>Login</h2>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputWrapper}>
            <FiMail style={styles.inputIcon} />
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
          </div>

          <div style={styles.inputWrapper}>
            <FiLock style={styles.inputIcon} />
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
              {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>

          <div style={styles.captchaContainer}>
            <CaptchaInput
              value={captcha}
              onChange={setCaptcha}
              onCaptchaIdChange={setCaptchaId}
              error={captchaError}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={styles.submitBtn}
          >
            {isLoading ? 'Iniciando sesión...' : 'Login'}
          </button>

          <button
            type="button"
            onClick={handleGoogleLogin}
            style={styles.googleBtn}
          >
            <FcGoogle size={20} />
            Continuar con Google
          </button>
        </form>

        <div style={styles.footerText}>
          ¿No tienes una cuenta?{' '}
          <Link to="/register" style={styles.footerLink}>Registrate</Link>
        </div>
        <div style={styles.forgotPassword}>
          <Link to="/forgot-password" style={styles.forgotLink}>
            ¿Olvidaste tu contraseña?
          </Link>
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
    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${fondoLogin})`,
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
  navButton: {
    color: '#ffffff',
    textDecoration: 'none',
    fontSize: '14px',
    border: '1.5px solid #ffffff',
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
    width: '100%',
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
    boxSizing: 'border-box',
    caretColor: '#ffffff',
  },
  inputIcon: {
    position: 'absolute',
    left: '0',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'rgba(0,0,0,0.5)',
    fontSize: '18px',
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
  googleBtn: {
    marginTop: '2px',
    background: '#ffffff',
    color: '#333333',
    border: '1px solid #ddd',
    borderRadius: '6px',
    padding: '10px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    transition: 'background 0.2s',
  },
  footerText: {
    marginTop: '20px',
    textAlign: 'center',
    fontSize: '13px',
    color: '#000000',
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
  captchaContainer: {
    marginTop: '8px',
  },
  forgotPassword: {
    //TOP
    textAlign: 'center',
    marginTop: '2px',
  },
  forgotLink: {
    color: '#7ec8f5',
    fontSize: '12px',
    textDecoration: 'none',
  },
};