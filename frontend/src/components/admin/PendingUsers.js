// frontend/src/components/admin/PendingUsers.js
import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const PendingUsers = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPendingUsers = async () => {
      try {
        const response = await api.get('/admin/pending-users');
        setUsers(response.data);
        setLoading(false);
      } catch (err) {
        setError('Error al cargar usuarios pendientes');
        setLoading(false);
      }
    };

    fetchPendingUsers();
  }, []);

  const handleApprove = async (userId) => {
    try {
      await api.post(`/admin/approve-user/${userId}`);
      setUsers(users.filter((user) => user.atr_id_usuario !== userId));
    } catch (err) {
      setError('Error al aprobar usuario');
    }
  };

  const handleReject = async (userId) => {
    try {
      await api.post(`/admin/reject-user/${userId}`);
      setUsers(users.filter((user) => user.atr_id_usuario !== userId));
    } catch (err) {
      setError('Error al rechazar usuario');
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-3">Usuarios Pendientes de Aprobación</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {loading ? (
        <p>Cargando...</p>
      ) : users.length === 0 ? (
        <p>No hay usuarios pendientes de aprobación.</p>
      ) : (
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Registrado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.atr_id_usuario}>
                <td>{user.atr_usuario}</td>
                <td>{user.atr_nombre_usuario}</td>
                <td>{user.atr_correo_electronico}</td>
                <td>{new Date(user.atr_fecha_creacion).toLocaleDateString()}</td>
                <td>
                  <button
                    className="btn btn-success btn-sm me-2"
                    onClick={() => handleApprove(user.atr_id_usuario)}
                  >
                    Aprobar
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleReject(user.atr_id_usuario)}
                  >
                    Rechazar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PendingUsers;
