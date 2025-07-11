// frontend/src/pages/EmailVerifiedPage.jsx
import React from 'react';
import { useLocation, Link } from 'react-router-dom';

export default function EmailVerifiedPage() {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const success = params.get('success') === 'true';
  const error   = params.get('error');

  return (
    <div className="email-verified p-5 text-center">
      {success
        ? <h2>✅ ¡Tu correo ha sido verificado con éxito!</h2>
        : <>
            <h2>❌ Hubo un problema al verificar tu correo</h2>
            {error && <p>Error: {decodeURIComponent(error)}</p>}
          </>
      }
      <Link to="/login" className="btn btn-primary mt-4">
        Volver a Iniciar Sesión
      </Link>
    </div>
  );
}

