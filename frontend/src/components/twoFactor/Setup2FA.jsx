// frontend/src/components/twoFactor/Setup2FA.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';

const Setup2FA = () => {
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const { updateUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const setup2FA = async () => {
      try {
        const response = await api.get('/auth/2fa/setup');
        setQrCode(response.data.qrCode || response.data.secretUri);
        setSecret(response.data.secret);
        setBackupCodes(response.data.backupCodes || []);
      } catch (err) {
        setError('Error al configurar 2FA');
      }
    };

    setup2FA();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const response = await api.post('/auth/2fa/verify', { token });
      setSuccess('Autenticación en dos pasos habilitada');
      setBackupCodes(response.data.backupCodes || []);

      const updatedUser = await api.get('/auth/me');
      updateUser(updatedUser.data);

      // Redirige según el rol
      const destino = updatedUser.data.atr_id_rol === 1 ? '/admin' : '/dashboard';
      navigate(destino);
    } catch (err) {
      setError('Código inválido');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow-md">
      <h2 className="text-2xl font-bold mb-6">Configurar 2FA</h2>

      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>
      )}
      {success && (
        <div className="mb-4 p-2 bg-green-100 text-green-700 rounded">{success}</div>
      )}

      {qrCode && (
        <div className="mb-6 text-center">
          <p className="mb-4">Escanea este código con Google Authenticator:</p>
          <div className="flex justify-center mb-4">
            <QRCodeCanvas value={qrCode} />
          </div>
          <p className="text-center mb-4">O ingresa manualmente este código:</p>
          <div className="p-3 bg-gray-100 rounded text-center font-mono">{secret}</div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">
            Código de verificación de 6 dígitos
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded text-center text-xl"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="000000"
            maxLength={6}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          Verificar y continuar
        </button>
      </form>

      {backupCodes.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Códigos de respaldo</h3>
          <p className="mb-2 text-sm text-red-600">
            Guarda estos códigos en un lugar seguro.
          </p>
          <ul className="grid grid-cols-2 gap-2 text-center text-sm font-mono">
            {backupCodes.map((code) => (
              <li key={code} className="bg-gray-100 p-2 rounded">{code}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Setup2FA;
