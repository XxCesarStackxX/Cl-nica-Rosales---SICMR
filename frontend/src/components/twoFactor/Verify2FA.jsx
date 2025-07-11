// frontend/src/components/twoFactor/Verify2FA.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import api from '../../services/api';

/**
 * Componente para verificar 2FA via app, correo o código de respaldo
 */
const Verify2FA = ({ userId, onSuccess, userEmail }) => {
  const [token, setToken] = useState('');
  const [backupCode, setBackupCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [activeTab, setActiveTab] = useState('app');
  const [showAnimation, setShowAnimation] = useState(true);

  // Temporizador de reenvío
  useEffect(() => {
    let timer;
    if (resendDisabled && resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    } else if (resendTimer === 0) {
      setResendDisabled(false);
      setResendTimer(30);
    }
    return () => clearTimeout(timer);
  }, [resendDisabled, resendTimer]);

  // Animación inicial
  useEffect(() => {
    const timer = setTimeout(() => setShowAnimation(false), 300);
    return () => clearTimeout(timer);
  }, []);

  // Verificar código de app
  const handleTokenSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/2fa/verify-login', { userId, token });
      onSuccess(response.data);
    } catch {
      setError('Código inválido. Por favor, inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  // Verificar código de respaldo
  const handleBackupSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/2fa/verify-login', { userId, token: backupCode });
      onSuccess(response.data);
    } catch {
      setError('Código de respaldo inválido. Por favor, verifica.');
    } finally {
      setIsLoading(false);
    }
  };

  // Reenviar código de correo
  const handleResendCode = async () => {
    setResendDisabled(true);
    setError('');
    try {
      await api.post('/auth/2fa/resend-code', { userId });
    } catch {
      setError('Error al reenviar el código. Inténtalo de nuevo.');
    }
  };

  // Verificar código enviado por email
  const handleEmailCodeSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/2fa/verify-email-code', { userId, token });
      onSuccess(response.data);
    } catch {
      setError('Código inválido. Por favor, inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  // Botón de pestaña
  const renderTabButton = (tabKey, label, iconPath) => (
    <button
      className={`py-3 px-4 font-medium text-sm flex-1 transition-all ${
        activeTab === tabKey 
          ? 'text-blue-600 border-b-2 border-blue-600' 
          : 'text-gray-500 hover:text-gray-700'
      }`}
      onClick={() => setActiveTab(tabKey)}
    >
      <div className="flex flex-col items-center">
        <svg className="w-5 h-5 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          {iconPath}
        </svg>
        <span>{label}</span>
      </div>
    </button>
  );

  return (
    <div className={`max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden p-6 transition-all duration-300 ${
      showAnimation ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
    }`}>
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex justify-center mb-4">
          <div className="bg-blue-50 rounded-full w-16 h-16 flex items-center justify-center">
            <svg className="w-8 h-8 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Verificación de Seguridad</h2>
        <p className="text-gray-600 mt-2">Para proteger tu cuenta, necesitamos verificar tu identidad</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        {renderTabButton(
          'app', 'Autenticador',
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        )}
... (continúa con las demás pestañas y formularios sin modificar ruta) ...
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start animate-shake">
          <svg className="w-5 h-5 text-red-500 mt-0.5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Inline CSS para animaciones */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shake { 0%,100% { transform: translateX(0); } 20%,60% { transform: translateX(-5px);} 40%,80% { transform: translateX(5px);} }
        .animate-fadeIn { animation: fadeIn 0.3s ease-in-out; }
        .animate-shake { animation: shake 0.5s ease-in-out; }
      `}</style>
    </div>
  );
};

export default Verify2FA;