// frontend/src/components/auth/LoginForm.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import './LoginForm.css';

const LoginForm = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [maxLoginAttempts, setMaxLoginAttempts] = useState(3);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [twoFARequired, setTwoFARequired] = useState(false);
  const [userIdFor2FA, setUserIdFor2FA] = useState(null);
  const [twoFAToken, setTwoFAToken] = useState('');
  const [twoFAError, setTwoFAError] = useState('');

  useEffect(() => {
    const fetchParams = async () => {
      try {
        const response = await api.get('/params/ADMIN_INTENTOS_INVALIDOS');
        setMaxLoginAttempts(parseInt(response.data.atr_valor, 10) || 3);
      } catch (error) {
        console.error('Error obteniendo parámetros:', error);
      }
    };
    fetchParams();
  }, []);

  const preventCopyPaste = (e) => {
    e.preventDefault();
  };

  const handleChange = ({ target: { name, value } }) => {
    let v = value;
    if (name === 'name') v = v.replace(/\s/g, '').replace(/[^a-zA-Z0-9]/g, '').slice(0, 15);
    if (name === 'username') v = v.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 15);
    if (name === 'email') v = v.replace(/[^a-zA-Z0-9@._-]/g, '');
    if (name === 'password' || name === 'confirmPassword') v = v.replace(/[^a-zA-Z0-9!@#$%^&*]/g, '');

    setFormData((prev) => ({ ...prev, [name]: v }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const newErrors = {};
    const { username, email, password, confirmPassword, name } = formData;

    if (!isLogin) {
      if (!name.trim()) newErrors.name = 'Nombre requerido';
      else if (name.length < 2) newErrors.name = 'Mínimo 2 caracteres';
      else if (name.length > 15) newErrors.name = 'Máximo 15 caracteres';
      else if (!/^[a-zA-Z0-9]+$/.test(name)) newErrors.name = 'Solo letras y números';
    }

    if (!username.trim()) newErrors.username = 'Usuario requerido';
    else if (username.length < 4) newErrors.username = 'Mínimo 4 caracteres';
    else if (username.length > 15) newErrors.username = 'Máximo 15 caracteres';
    else if (!/^[A-Z0-9]+$/.test(username)) newErrors.username = 'Solo mayúsculas y números';

    if (!isLogin) {
      if (!email.trim()) newErrors.email = 'Email requerido';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Email no válido';
      else if (email.length > 50) newErrors.email = 'Máximo 50 caracteres';
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    if (!password) newErrors.password = 'Contraseña requerida';
    else if (/\s/.test(password)) newErrors.password = 'No se permiten espacios';
    else if (!passwordRegex.test(password)) newErrors.password = 'Debe contener minúscula, mayúscula, número y carácter especial';
    else if (password.length > 200) newErrors.password = 'Máximo 200 caracteres';

    if (!isLogin && password !== confirmPassword) newErrors.confirmPassword = 'Las contraseñas no coinciden';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAuthError = (error) => {
    if (!error.response) {
      setApiError(error.message || 'Error de conexión');
      return;
    }
    const { status, data } = error.response;
    switch (status) {
      case 400:
        setApiError(data.error || 'Datos inválidos');
        break;
      case 401:
        setLoginAttempts((prev) => prev + 1);
        setApiError(`Credenciales incorrectas. Intentos restantes: ${maxLoginAttempts - loginAttempts - 1}`);
        break;
      case 403:
        setIsLocked(true);
        setApiError(data.error || 'Cuenta bloqueada');
        break;
      case 409:
        setApiError('El usuario ya existe');
        break;
      case 429:
        setApiError('Demasiados intentos. Intenta más tarde');
        break;
      default:
        setApiError(data.error || 'Error en el servidor');
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setApiError('');
  setTwoFAError('');

  if (!validate()) return;
  if (isLogin && loginAttempts >= maxLoginAttempts) {
    setApiError('Cuenta bloqueada. Contacte al administrador.');
    setIsLocked(true);
    return;
  }

  setIsSubmitting(true);
  try {
    if (isLogin) {
      const { data } = await api.post('/auth/login', {
        username: formData.username,
        password: formData.password
      });

      // Si requiere configurar 2FA
      if (data.require2FASetup) {
        localStorage.setItem('token', data.token);
        axios.defaults.headers.common.Authorization = `Bearer ${data.token}`;
        login(data.token, data.firstLogin || false, data.user); // ✅ esto activa sesión
        navigate('/setup-2fa');
      return;
      }


      // Si requiere verificar código 2FA
      if (data.twoFARequired) {
        setTwoFARequired(true);
        setUserIdFor2FA(data.userId);
        return;
      }

      // Si ya tiene token y todo está listo
      if (data.token && data.user) {
        localStorage.setItem('token', data.token);
        axios.defaults.headers.common.Authorization = `Bearer ${data.token}`;
        login(data.token, data.firstLogin || false, data.user);
        navigate(data.user.atr_id_rol === 1 ? '/citas' : '/dashboard');
        return;
      }

      setApiError('No se pudo iniciar sesión. Intenta más tarde.');
    } else {
      // Registro
      await api.post('/auth/register', {
        username: formData.username,
        name: formData.name,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword
      });
      setRegistrationSuccess(true);
    }
  } catch (error) {
    handleAuthError(error);
  } finally {
    setIsSubmitting(false);
  }
};

  const handle2FAVerification = async () => {
    if (!twoFAToken) {
      setTwoFAError('Ingrese el código de verificación');
      return;
    }
    setIsSubmitting(true);
    setTwoFAError('');
    try {
      const { data } = await axios.post(
        '/api/auth/2fa/verify-login',
        { userId: userIdFor2FA, token: twoFAToken }
      );
      localStorage.setItem('token', data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        login(data.token, data.firstLogin || false, data.user);
        navigate(data.user.atr_id_rol === 1 ? '/citas' : '/dashboard');
    } catch (error) {
      if (!error.response) setTwoFAError('Error de conexión');
      else if (error.response.status === 400) setTwoFAError('Código inválido');
      else if (error.response.status === 401) setTwoFAError('Código expirado o inválido');
      else setTwoFAError('Error en el servidor');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin((prev) => !prev);
    setFormData({ name: '', username: '', email: '', password: '', confirmPassword: '' });
    setErrors({});
    setApiError('');
    setIsLocked(false);
    setLoginAttempts(0);
    setRegistrationSuccess(false);
    setTwoFARequired(false);
    setTwoFAToken('');
    setTwoFAError('');
  };

  if (registrationSuccess) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="clinic-header">
            <div className="clinic-logo">ER</div>
            <h1 className="clinic-name">Estética Rosales</h1>
            <p className="clinic-specialty">Medicina Estética Integral</p>
          </div>
          <div className="success-message">
            <h2>¡Registro Exitoso!</h2>
            <p>Tu cuenta ha sido creada correctamente.</p>
            <p>Un administrador revisará tu solicitud y te notificará cuando puedas acceder.</p>
            <button onClick={toggleAuthMode} className="auth-button">Volver al Login</button>
          </div>
        </div>
      </div>
    );
  }

  if (twoFARequired) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="clinic-header">
            <div className="clinic-logo">ER</div>
            <h1 className="clinic-name">Estética Rosales</h1>
            <p className="clinic-specialty">Medicina Estética Integral</p>
          </div>
          <div className="auth-form">
            <h2>Verificación en Dos Pasos</h2>
            <p>Ingresa el código de tu aplicación de autenticación</p>
            <div className="form-group">
              <input
                type="text"
                placeholder="Código de verificación"
                value={twoFAToken}
                onChange={(e) => setTwoFAToken(e.target.value)}
                maxLength={6}
                className={twoFAError ? 'error' : ''}
              />
              {twoFAError && <span className="error-message">{twoFAError}</span>}
            </div>
            <button onClick={handle2FAVerification} disabled={isSubmitting} className="auth-button">
              {isSubmitting ? 'Verificando...' : 'Verificar'}
            </button>
            <button onClick={() => { setTwoFARequired(false); setTwoFAToken(''); setTwoFAError(''); }} className="auth-button secondary">
              Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="clinic-header">
          <div className="clinic-logo">ER</div>
          <h1 className="clinic-name">Estética Rosales</h1>
          <p className="clinic-specialty">Medicina Estética Integral</p>
        </div>
        <div className="auth-form">
          <h2>{isLogin ? 'Iniciar Sesión' : 'Registro'}</h2>
          {apiError && <div className="error-message global-error">{apiError}</div>}
          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="form-group">
                <input
                  type="text"
                  name="name"
                  placeholder="Nombre"
                  value={formData.name}
                  onChange={handleChange}
                  onCopy={preventCopyPaste}
                  onPaste={preventCopyPaste}
                  className={errors.name ? 'error' : ''}
                  disabled={isSubmitting}
                />
                {errors.name && <span className="error-message">{errors.name}</span>}
              </div>
            )}
            <div className="form-group">
              <input
                type="text"
                name="username"
                placeholder="Usuario"
                value={formData.username}
                onChange={handleChange}
                onCopy={preventCopyPaste}
                onPaste={preventCopyPaste}
                className={errors.username ? 'error' : ''}
                disabled={isSubmitting}
              />
              {errors.username && <span className="error-message">{errors.username}</span>}
            </div>
            {!isLogin && (
              <div className="form-group">
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  onCopy={preventCopyPaste}
                  onPaste={preventCopyPaste}
                  className={errors.email ? 'error' : ''}
                  disabled={isSubmitting}
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>
            )}
            <div className="form-group">
              <input
                type="password"
                name="password"
                placeholder="Contraseña"
                value={formData.password}
                onChange={handleChange}
                onCopy={preventCopyPaste}
                onPaste={preventCopyPaste}
                className={errors.password ? 'error' : ''}
                disabled={isSubmitting}
              />
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>
            {!isLogin && (
              <div className="form-group">
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirmar Contraseña"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onCopy={preventCopyPaste}
                  onPaste={preventCopyPaste}
                  className={errors.confirmPassword ? 'error' : ''}
                  disabled={isSubmitting}
                />
                {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
              </div>
            )}
            <button type="submit" disabled={isSubmitting || isLocked} className="auth-button">
              {isSubmitting ? (isLogin ? 'Iniciando...' : 'Registrando...') : (isLogin ? 'Iniciar Sesión' : 'Registrarse')}
            </button>
          </form>
          <div className="auth-links">
            <button onClick={toggleAuthMode} className="link-button" disabled={isSubmitting}>
              {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
            </button>
            {isLogin && (
              <button onClick={() => navigate('/forgot-password')} className="link-button" disabled={isSubmitting}>
                ¿Olvidaste tu contraseña?
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
