// frontend/src/pages/PermisosPage.jsx
import React, { useState, useEffect } from 'react';
import {
  getRoles,
  getObjetos,
  getPermisosByRol,
  upsertPermiso
} from '../services/permisoService';
import { useAuth } from '../context/AuthContext';

import '../styles/variables.css';

function PermisosPage() {
  const { token } = useAuth();
  const [roles, setRoles] = useState([]);
  const [objetos, setObjetos] = useState([]);
  const [rolSeleccionado, setRolSeleccionado] = useState('');
  const [permisos, setPermisos] = useState({});
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    async function cargarDatos() {
      setLoading(true);
      try {
        const [rolesRes, objetosRes] = await Promise.all([
          getRoles(token),
          getObjetos(token)
        ]);
        setRoles(rolesRes);
        setObjetos(objetosRes);
      } catch (err) {
        setMsg('Error cargando datos');
      } finally {
        setLoading(false);
      }
    }
    cargarDatos();
  }, [token]);

  useEffect(() => {
    if (!rolSeleccionado) {
      setPermisos({});
      return;
    }
    setLoading(true);
    getPermisosByRol(rolSeleccionado, token)
      .then(data => {
        const map = {};
        data.forEach(p => {
          map[p.atr_id_objeto] = {
            insertar: p.atr_permiso_insercion === 'SI',
            eliminar: p.atr_permiso_eliminacion === 'SI',
            actualizar: p.atr_permiso_actualizacion === 'SI',
            consultar: p.atr_permiso_consultar === 'SI'
          };
        });
        setPermisos(map);
      })
      .catch(() => setMsg('Error cargando permisos'))
      .finally(() => setLoading(false));
  }, [rolSeleccionado, token]);

  function handleCheckbox(objetoId, tipoPermiso) {
    setPermisos(prev => ({
      ...prev,
      [objetoId]: {
        ...prev[objetoId],
        [tipoPermiso]: !prev[objetoId]?.[tipoPermiso]
      }
    }));
  }

  async function handleGuardar(objetoId) {
    setLoading(true);
    setMsg('');
    try {
      const p = permisos[objetoId] || {};
      await upsertPermiso({
        atr_id_rol: parseInt(rolSeleccionado, 10),
        atr_id_objeto: objetoId,
        atr_permiso_insercion: p.insertar ? 'SI' : 'NO',
        atr_permiso_eliminacion: p.eliminar ? 'SI' : 'NO',
        atr_permiso_actualizacion: p.actualizar ? 'SI' : 'NO',
        atr_permiso_consultar: p.consultar ? 'SI' : 'NO'
      }, token);
      setMsg('Permiso guardado correctamente');
      setTimeout(() => setMsg(''), 1200);
    } catch (err) {
      setMsg('Error guardando permiso');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container p-4" style={{ maxWidth: 900 }}>
      <div
        className="card mb-4"
        style={{
          boxShadow: 'var(--box-shadow)',
          background: 'linear-gradient(90deg, var(--rosa-pastel), var(--lila-claro))',
          border: 'none'
        }}
      >
        <h2
          className="text-center"
          style={{
            color: '#a05b7b', // tono más oscuro y legible
            marginBottom: 8,
            fontWeight: 800,
            letterSpacing: 1.6
          }}
        >
          <span role="img" aria-label="key" style={{ fontSize: 28, marginRight: 8 }}></span>
          Administración de Permisos
        </h2>
        <p className="text-center" style={{ color: '#954e8c', fontWeight: 500 }}>
          Asigna los permisos de cada objeto a los roles del sistema
        </p>
      </div>

      {msg && (
        <div
          className={`alert ${msg.startsWith('Error') ? 'alert-error' : 'alert-success'}`}
          style={{
            marginBottom: 20,
            textAlign: 'center',
            background: msg.startsWith('Error')
              ? 'var(--rosa-suave)'
              : 'var(--rosa-pastel)',
            color: msg.startsWith('Error') ? 'var(--alerta)' : 'var(--lila-oscuro)'
          }}
        >
          {msg}
        </div>
      )}

      <div
        className="card"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 24,
          background: 'linear-gradient(90deg, #f7cac9 0%, #f7cac9 100%)', // Mismo rosa pastel en ambos extremos
          border: 'none',
          borderRadius: '18px',
          boxShadow: '0 2px 14px 0 rgba(200,162,200,0.07), 0 1.5px 7px 0 rgba(247,202,201,0.12)'
        }}
      >
        <label
          htmlFor="rol"
          className="form-label"
          style={{
            marginBottom: 0,
            marginRight: 12,
            color: '#a05b7b', // Más oscuro y legible
            fontWeight: 700,
            fontSize: 19,
            letterSpacing: 0.7
          }}
        >
          Selecciona un rol:
        </label>
        <select
          id="rol"
          value={rolSeleccionado}
          className="form-control"
          onChange={e => setRolSeleccionado(e.target.value)}
          style={{
            maxWidth: 220,
            minWidth: 150,
            marginLeft: 8,
            border: '1.5px solid #e999ba',
            background: 'linear-gradient(90deg, #fff6fb 70%, #f7cac9 100%)',
            color: '#8c5571',
            fontWeight: 600,
            borderRadius: '9px',
            boxShadow: '0 1.5px 6px 0 #f7cac9a6'
          }}
        >
          <option value="">-- Selecciona --</option>
          {roles.map(rol => (
            <option key={rol.atr_id_rol} value={rol.atr_id_rol}>
              {rol.atr_nombre_rol}
            </option>
          ))}
        </select>
      </div>

      {loading && (
        <div style={{
          textAlign: 'center',
          color: 'var(--lila)',
          margin: 12,
          fontWeight: 500
        }}>Cargando...</div>
      )}

      {/* Tabla de permisos */}
      {rolSeleccionado && (
        <div className="card" style={{ overflowX: 'auto' }}>
          <table className="table table-hover table-bordered" style={{
            minWidth: 600,
            borderRadius: 'var(--border-radius)',
            overflow: 'hidden',
            background: 'var(--light)'
          }}>
            <thead>
              <tr style={{ background: 'linear-gradient(90deg, var(--rosa-pastel), var(--lila))' }}>
                <th style={{ background: 'var(--lila)', color: 'white', textAlign: 'center' }}>Objeto</th>
                <th style={{ background: 'var(--rosa-oscuro)', color: 'white', textAlign: 'center' }}>Insertar</th>
                <th style={{ background: 'var(--rosa-oscuro)', color: 'white', textAlign: 'center' }}>Eliminar</th>
                <th style={{ background: 'var(--rosa-oscuro)', color: 'white', textAlign: 'center' }}>Actualizar</th>
                <th style={{ background: 'var(--rosa-oscuro)', color: 'white', textAlign: 'center' }}>Consultar</th>
                <th style={{ background: 'var(--lila-oscuro)', color: 'white', textAlign: 'center' }}>Guardar</th>
              </tr>
            </thead>
            <tbody>
              {objetos.map(obj => (
                <tr key={obj.atr_id_objetos} style={{ background: 'var(--lila-claro)' }}>
                  <td style={{ fontWeight: 500, color: 'var(--lila-oscuro)' }}>
                    {obj.atr_objeto}
                  </td>
                  {['insertar', 'eliminar', 'actualizar', 'consultar'].map(tipo => (
                    <td key={tipo} style={{ textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={!!permisos[obj.atr_id_objetos]?.[tipo]}
                      onChange={() => handleCheckbox(obj.atr_id_objetos, tipo)}
                      style={{
                        accentColor: '#e4ababff',
                        width: 18,
                        height: 18,
                        boxShadow: '0 0 3px #ff6b6b66'
                      }}
                    />
                    </td>
                  ))}
                  <td style={{ textAlign: 'center' }}>
                    <button
                      className="btn"
                      style={{
                        background: 'linear-gradient(90deg, var(--lila), var(--rosa-intenso))',
                        color: 'white',
                        minWidth: 90,
                        fontSize: 14,
                        fontWeight: 600,
                        border: 'none'
                      }}
                      onClick={() => handleGuardar(obj.atr_id_objetos)}
                      disabled={loading}
                    >
                      Guardar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!rolSeleccionado && (
        <div className="text-center" style={{ color: 'var(--lila-oscuro)', marginTop: 50 }}>
          <b>Selecciona un rol para administrar sus permisos.</b>
        </div>
      )}
    </div>
  );
}

export default PermisosPage;
