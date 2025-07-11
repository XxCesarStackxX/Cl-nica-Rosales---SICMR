// frontend/src/components/auth/ChangePassword.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import api from '../../services/api';
import * as S from './change-password-Style';

/**
 * Cambio de contraseña (primer login o cambio normal)
 */
const ChangePassword = () => {
  const { user, token, completeFirstLogin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Detectar primer ingreso
  useEffect(() => {
    if (location.state?.firstLogin || user?.atr_primer_ingreso) {
      setIsFirstLogin(true);
    }
  }, [location, user]);

  const validate = () => {
    const newErrors = {};
    const { currentPassword, newPassword, confirmPassword } = formData;

    if (!isFirstLogin && !currentPassword) {
      newErrors.currentPassword = 'Contraseña actual requerida';
    }

    if (!newPassword) {
      newErrors.newPassword = 'Nueva contraseña requerida';
    } else {
      if (newPassword.length < 8) newErrors.newPassword = 'Mínimo 8 caracteres';
      if (!/(?=.*[a-z])/.test(newPassword)) newErrors.newPassword = 'Debe contener minúscula';
      if (!/(?=.*[A-Z])/.test(newPassword)) newErrors.newPassword = 'Debe contener mayúscula';
      if (!/(?=.*\d)/.test(newPassword)) newErrors.newPassword = 'Debe contener número';
      if (!/(?=.*[!@#$%^&*])/.test(newPassword)) newErrors.newPassword = 'Debe contener carácter especial';
      if (/\s/.test(newPassword)) newErrors.newPassword = 'No se permiten espacios';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirma tu nueva contraseña';
    } else if (formData.newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    if (apiError) setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setApiError('');

    try {
      // Construir payload según tipo de cambio
      const payload = { newPassword: formData.newPassword };
      if (!isFirstLogin) payload.currentPassword = formData.currentPassword;

      const response = await api.post(
        '/auth/change-password',
        payload,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setSuccessMessage('Contraseña actualizada exitosamente');

      if (isFirstLogin) {
        completeFirstLogin();
        setTimeout(() => navigate('/dashboard'), 2000);
      } else {
        setTimeout(() => {
          logout();
          navigate('/login');
        }, 2000);
      }
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;
        if (status === 401) setApiError('Contraseña actual incorrecta');
        else if (status === 400) setApiError(data.error || 'Datos inválidos');
        else setApiError('Error en el servidor. Intenta nuevamente.');
      } else {
        setApiError('Error de conexión. Verifica tu internet.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <S.Container>
      <S.Card>
        <S.Header>
          <S.Logo>ER</S.Logo>
          <S.Title>Estética Rosales</S.Title>
          <S.Subtitle>Medicina Estética Integral</S.Subtitle>
        </S.Header>
        <S.FormContainer>
          <S.FormTitle>{isFirstLogin ? 'Configura tu contraseña' : 'Cambiar contraseña'}</S.FormTitle>
          <S.FormDescription>
            {isFirstLogin
              ? 'Por seguridad, debes cambiar tu contraseña antes de continuar'
              : 'Ingresa tu contraseña actual y la nueva contraseña'}
          </S.FormDescription>

          {successMessage && <S.SuccessMessage>{successMessage}</S.SuccessMessage>}
          {apiError && <S.ErrorMessage>{apiError}</S.ErrorMessage>}

          <S.Form onSubmit={handleSubmit}>
            {!isFirstLogin && (
              <S.FormGroup>
                <S.Label>Contraseña actual</S.Label>
                <S.Input
                  type="password"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  $hasError={!!errors.currentPassword}
                  placeholder="Tu contraseña actual"
                />
                {errors.currentPassword && <S.ErrorText>{errors.currentPassword}</S.ErrorText>}
              </S.FormGroup>
            )}

            <S.FormGroup>
              <S.Label>Nueva contraseña</S.Label>
              <S.Input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                $hasError={!!errors.newPassword}
                placeholder="Mínimo 8 caracteres"
              />
              {errors.newPassword && <S.ErrorText>{errors.newPassword}</S.ErrorText>}
            </S.FormGroup>

            <S.FormGroup>
              <S.Label>Confirmar nueva contraseña</S.Label>
              <S.Input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                $hasError={!!errors.confirmPassword}
                placeholder="Repite tu nueva contraseña"
              />
              {errors.confirmPassword && <S.ErrorText>{errors.confirmPassword}</S.ErrorText>}
            </S.FormGroup>

            <S.PasswordRequirements>
              <h4>La contraseña debe contener:</h4>
              <ul>
                <li className={formData.newPassword.length >= 8 ? 'valid' : ''}>Mínimo 8 caracteres</li>
                <li className={/(?=.*[a-z])/.test(formData.newPassword) ? 'valid' : ''}>1 minúscula</li>
                <li className={/(?=.*[A-Z])/.test(formData.newPassword) ? 'valid' : ''}>1 mayúscula</li>
                <li className={/(?=.*\d)/.test(formData.newPassword) ? 'valid' : ''}>1 número</li>
                <li className={/(?=.*[!@#$%^&*])/.test(formData.newPassword) ? 'valid' : ''}>1 carácter especial</li>
                <li className={!/\s/.test(formData.newPassword) ? 'valid' : 'invalid'}>Sin espacios</li>
              </ul>
            </S.PasswordRequirements>

            <S.Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Procesando...' : 'Cambiar contraseña'}
            </S.Button>
            {!isFirstLogin && (
              <S.CancelButton type="button" onClick={() => navigate('/dashboard')}>Cancelar</S.CancelButton>
            )}
          </S.Form>
        </S.FormContainer>

        <S.Footer>
          <p>© {new Date().getFullYear()} Clínica Estética Rosales</p>
          <p>Todos los derechos reservados</p>
        </S.Footer>
      </S.Card>
    </S.Container>
  );
};

export default ChangePassword;
