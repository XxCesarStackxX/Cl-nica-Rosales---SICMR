// frontend/src/components/auth/ForgotPassword.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from '../../services/api';
import './ForgotPassword.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    if (!email.trim()) {
      setStatus({ type: 'error', message: 'Email requerido' });
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password', {
        email: email.trim()
      });
      setStatus({ type: 'success', message: data.message });
    } catch (err) {
      setStatus({
        type: 'error',
        message: err.response?.data?.error || 'Error del servidor'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <h2>Recuperar contraseña</h2>
      {status && <p className={status.type}>{status.message}</p>}
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Correo electrónico</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Enviando…' : 'Enviar instrucciones'}
        </button>
      </form>
      <button onClick={() => navigate('/login')}>Volver al login</button>
    </div>
  );
}
