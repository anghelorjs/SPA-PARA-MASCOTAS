// src/pages/auth/Register.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // ← Agregar useNavigate
import { useAuth } from '../../hooks/useAuth';
import fondoLogin from '../../assets/fondo_login.png';

export const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate(); // ← Agregar navigate
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
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
      // ✅ Redirigir al dashboard después del registro exitoso
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fields: { name: keyof typeof formData; label: string; type: string; required?: boolean }[] = [
    { name: 'nombre',               label: 'Nombre',              type: 'text',     required: true },
    { name: 'apellido',             label: 'Apellido',            type: 'text',     required: true },
    { name: 'email',                label: 'Correo electrónico',  type: 'email',    required: true },
    { name: 'telefono',             label: 'Teléfono',            type: 'tel' },
    { name: 'direccion',            label: 'Dirección',           type: 'text' },
    { name: 'password',             label: 'Contraseña',          type: 'password', required: true },
    { name: 'password_confirmation',label: 'Confirmar Contraseña',type: 'password', required: true },
  ];

  return (
    <div style={styles.page}>
      {/* NAVBAR */}
      <nav style={styles.navbar}>
        <span style={styles.navLogo}>PetSpa</span>
        <div style={styles.navLinks}>
          <Link to="/login" style={styles.navButton}>Login</Link>
        </div>
      </nav>

      {/* CARD */}
      <div style={styles.card}>
        <h2 style={styles.title}>Crear Cuenta</h2>
        <p style={styles.subtitle}>Regístrate como cliente</p>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          {fields.map(({ name, label, type, required }) => {
            const isPasswordField = type === 'password';
            const resolvedType = isPasswordField
              ? (showPassword ? 'text' : 'password')
              : type;

            return (
              <div key={name} style={styles.inputWrapper}>
                <input
                  id={name}
                  name={name}
                  type={resolvedType}
                  required={required}
                  value={formData[name]}
                  onChange={handleChange}
                  placeholder={label}
                  autoComplete={name === 'email' ? 'email' : undefined}
                  style={styles.input}
                />
                {name === 'password' && (
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={styles.eyeBtn}
                    aria-label="Toggle password"
                  >
                    {showPassword ? '🔓' : '🔒'}
                  </button>
                )}
              </div>
            );
          })}

          <button
            type="submit"
            disabled={isLoading}
            style={styles.submitBtn}
          >
            {isLoading ? 'Registrando...' : 'Registrarse'}
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
    backgroundImage: `url(${fondoLogin})`,
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
  },
  navButton: {
    color: '#000000',
    textDecoration: 'none',
    fontSize: '14px',
    border: '1.5px solid #000000',
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
    gap: '14px',
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
    caretColor: '#ffffff',
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