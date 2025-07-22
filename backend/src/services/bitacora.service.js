// backend/src/services/bitacora.service.js

const sequelize = require('../config/db');
const { logError } = require('./error.service');

class BitacoraService {
  /**
   * Registra un evento en la bitácora del sistema
   * @param {Object} params - Parámetros del evento
   * @param {number} params.usuarioId - ID del usuario que realiza la acción
   * @param {number} params.objetoId - ID del objeto/pantalla donde ocurre el evento
   * @param {string} params.accion - Tipo de acción (Ingreso, Nuevo, Update, Delete, Consulta)
   * @param {string} params.descripcion - Descripción detallada del evento
   * @param {string} [params.ip] - Dirección IP del usuario (opcional)
   * @returns {Promise<number>} ID del registro creado
   */
  static async registrarEvento({ usuarioId, objetoId, accion, descripcion, ip = null }) {
    try {
      const [result] = await sequelize.query(
        `INSERT INTO tbl_ms_bitacora (
            atr_fecha,
            atr_id_usuario,
            atr_id_objetos,
            atr_accion,
            atr_descripcion
        ) VALUES (
            NOW(),
            :usuarioId,
            :objetoId,
            :accion,
            :descripcion
        )`,
        {
          replacements: { usuarioId, objetoId, accion, descripcion },
          type: sequelize.QueryTypes.INSERT
        }
      );
      return result;
    } catch (error) {
      logError(`Error al registrar en bitácora: ${error.message}`, { stack: error.stack });
      throw new Error('No se pudo registrar el evento de auditoría');
    }
  }

    /**
   * Obtiene eventos de bitácora con filtros básicos
   * @param {Object} [filtros]
   * @param {string} [filtros.username]
   * @param {string} [filtros.accion]
   * @param {string} [filtros.from]   - YYYY-MM-DD
   * @param {string} [filtros.to]     - YYYY-MM-DD
   * @param {number} [filtros.limit=100]
   * @param {number} [filtros.offset=0]
   * @returns {Promise<Array>}
   */
 static async obtenerEventos(filtros = {}) {
    const defaultLimit = 100;
    try {
      let query = `
        SELECT
          b.atr_id_bitacora   AS ID_BITACORA,
          b.atr_fecha         AS FECHA,
          u.atr_usuario       AS USUARIO,
          o.atr_objeto        AS OBJETO,
          b.atr_accion        AS ACCION,
          b.atr_descripcion   AS DESCRIPCION
        FROM tbl_ms_bitacora b
        LEFT JOIN tbl_ms_usuario u   ON b.atr_id_usuario  = u.atr_id_usuario
        LEFT JOIN tbl_objetos     o ON b.atr_id_objetos = o.atr_id_objetos
        WHERE 1=1
      `;

      const replacements = {
        limit:  filtros.limit  || defaultLimit,
        offset: filtros.offset || 0
      };

      if (filtros.username) {
        query += ' AND u.atr_usuario LIKE :username';
        replacements.username = `%\${filtros.username}%`;
      }
      if (filtros.accion) {
        query += ' AND b.atr_accion LIKE :accion';
        replacements.accion = `%${filtros.accion}%`;
      }
      if (filtros.from) {
        query += ' AND DATE(b.atr_fecha) >= :from';
        replacements.from = filtros.from;
      }
      if (filtros.to) {
        query += ' AND DATE(b.atr_fecha) <= :to';
        replacements.to = filtros.to;
      }

      query += ' ORDER BY b.atr_fecha DESC LIMIT :limit OFFSET :offset';

      const [results] = await sequelize.query(query, {
        replacements,
        type: sequelize.QueryTypes.SELECT
      });
      return results;
    } catch (error) {
      logError(
        `Error al consultar bitácora: ${error.message}`,
        { stack: error.stack, endpoint: 'BitacoraService.obtenerEventos' }
      );
      throw new Error('No se pudieron obtener los registros de auditoría');
    }
  }

  /**
   * Obtiene estadísticas de actividad por usuario
   * @param {string|null} fechaInicio - YYYY-MM-DD
   * @param {string|null} fechaFin    - YYYY-MM-DD
   * @returns {Promise<Array>}
   */
  static async obtenerEstadisticas(fechaInicio = null, fechaFin = null) {
    try {
      const [results] = await sequelize.query(
        `SELECT
            u.atr_id_usuario     AS ID_USUARIO,
            u.atr_usuario        AS USUARIO,
            COUNT(b.atr_id_bitacora) AS total_eventos,
            SUM(CASE WHEN b.atr_accion = 'Ingreso' THEN 1 ELSE 0 END) AS ingresos,
            SUM(CASE WHEN b.atr_accion = 'Update'  THEN 1 ELSE 0 END) AS actualizaciones,
            SUM(CASE WHEN b.atr_accion = 'Delete'  THEN 1 ELSE 0 END) AS eliminaciones
          FROM tbl_ms_usuario u
          LEFT JOIN tbl_ms_bitacora b ON u.atr_id_usuario = b.atr_id_usuario
          WHERE (:fechaInicio IS NULL OR DATE(b.atr_fecha) >= :fechaInicio)
            AND (:fechaFin    IS NULL OR DATE(b.atr_fecha) <= :fechaFin)
          GROUP BY u.atr_id_usuario, u.atr_usuario
          ORDER BY total_eventos DESC`,
        {
          replacements: { fechaInicio, fechaFin },
          type: sequelize.QueryTypes.SELECT
        }
      );
      return results;
    } catch (error) {
      logError(
        `Error al obtener estadísticas: ${error.message}`,
        { stack: error.stack, endpoint: 'BitacoraService.obtenerEstadisticas' }
      );
      throw new Error('No se pudieron generar las estadísticas');
    }
  }
}

module.exports = BitacoraService;
