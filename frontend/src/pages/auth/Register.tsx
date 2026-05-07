// src/pages/auth/Register.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiUser, FiPhone, FiMapPin, FiEye, FiEyeOff } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../../hooks/useAuth';
import fondoLogin from '../../assets/fondo_login.png';
import { PasswordStrengthMeter } from '../../components/common/PasswordStrengthMeter';
import { authService } from '../../services/auth/authService';

export const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    password_confirmation: '',
    telefono: '',
    direccion: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = () => {
    authService.loginWithGoogle();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    if (formData.password !== formData.password_confirmation) {
      setError('Las contraseñas no coinciden');
      setIsLoading(false);
      return;
    }
    
    try {
      await register({
        nombre: formData.nombre,
        apellido: formData.apellido,
        email: formData.email,
        password: formData.password,
        telefono: formData.telefono,
        direccion: formData.direccion,
      });
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fields = [
    { name: 'nombre', label: 'Nombre', icon: <FiUser size={18} />, type: 'text', required: true },
    { name: 'apellido', label: 'Apellido', icon: <FiUser size={18} />, type: 'text', required: true },
    { name: 'email', label: 'Correo electrónico', icon: <FiMail size={18} />, type: 'email', required: true },
    { name: 'telefono', label: 'Teléfono', icon: <FiPhone size={18} />, type: 'tel', required: false },
    { name: 'direccion', label: 'Dirección', icon: <FiMapPin size={18} />, type: 'text', required: false },
  ];

  return (
    <div style={styles.page}>
      <nav style={styles.navbar}>
        <span style={styles.navLogo}>PetSpa</span>
        <div style={styles.navLinks}>
          <Link to="/login" style={styles.navButton}>Login</Link>
        </div>
      </nav>

      <div style={styles.card}>
        <h2 style={styles.title}>Crear Cuenta</h2>
        <p style={styles.subtitle}>Regístrate como cliente</p>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Campos normales (nombre, apellido, email, teléfono, dirección) */}
          {fields.map(({ name, label, icon, type, required }) => (
            <div key={name} style={styles.inputWrapper}>
              <span style={styles.inputIcon}>{icon}</span>
              <input
                id={name}
                name={name}
                type={type}
                required={required}
                value={formData[name as keyof typeof formData]}
                onChange={handleChange}
                placeholder={label}
                autoComplete={name === 'email' ? 'email' : undefined}
                style={styles.input}
              />
            </div>
          ))}

          {/* Campo de Contraseña (con medidor debajo) */}
          <div style={styles.passwordWrapper}>
            <div style={styles.inputWrapper}>
              <span style={styles.inputIcon}><FiLock size={18} /></span>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Contraseña"
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
            {/* Medidor de fuerza - fuera del inputWrapper */}
            {formData.password && (
              <div style={styles.strengthMeterContainer}>
                <PasswordStrengthMeter password={formData.password} />
              </div>
            )}
          </div>

          {/* Campo de Confirmar Contraseña */}
          <div style={styles.inputWrapper}>
            <span style={styles.inputIcon}><FiLock size={18} /></span>
            <input
              id="password_confirmation"
              name="password_confirmation"
              type={showConfirmPassword ? 'text' : 'password'}
              required
              value={formData.password_confirmation}
              onChange={handleChange}
              placeholder="Confirmar Contraseña"
              style={styles.input}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.eyeBtn}
              aria-label="Toggle password"
            >
              {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={styles.submitBtn}
          >
            {isLoading ? 'Registrando...' : 'Registrarse'}
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
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" style={styles.footerLink}>Inicia Sesión</Link>
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
  },
  card: {
    background: 'rgba(180, 210, 240, 0.18)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(0,0,0,0.25)',
    borderRadius: '16px',
    padding: '36px 36px',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
    marginTop: '72px',
    marginBottom: '32px',
  },
  title: {
    color: '#000000',
    fontSize: '26px',
    fontWeight: 600,
    textAlign: 'center',
    margin: '0 0 4px 0',
    letterSpacing: '0.5px',
  },
  subtitle: {
    color: 'rgba(0,0,0,0.65)',
    fontSize: '13px',
    textAlign: 'center',
    margin: '0 0 24px 0',
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
    padding: '10px 28px 10px 28px',
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
    display: 'flex',
    alignItems: 'center',
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
    letterSpacing: '0.5px',
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
  },
  footerText: {
    marginTop: '18px',
    textAlign: 'center',
    fontSize: '13px',
    color: 'rgba(0,0,0,0.75)',
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