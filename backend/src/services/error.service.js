// backend/src/services/error.service.js
const { sequelize } = require('../config/db');
const fs = require('fs');
const path = require('path');

class ErrorService {
    /**
     * Registra errores en archivo de log y base de datos
     * @param {string} errorMessage - Mensaje descriptivo
     * @param {Object} [errorDetails] - Detalles adicionales
     */
    static async logError(errorMessage, errorDetails = {}) {
        const timestamp = new Date().toISOString();
        const entry = ErrorService._formatLogEntry(timestamp, errorMessage, errorDetails);
        try {
            ErrorService._writeToFile(entry);
            if (process.env.LOG_ERRORS_TO_DB === 'true') {
                await ErrorService._saveToDatabase(timestamp, errorMessage, errorDetails);
            }
            if (process.env.NODE_ENV === 'development') {
                console.error(entry);
            }
        } catch (dbError) {
            ErrorService._writeToFile(`[DB-ERROR] ${entry}`);
            console.error('Error al registrar error en BD:', dbError);
        }
    }

    /**
     * Formatea la entrada de log
     * @private
     */
    static _formatLogEntry(timestamp, message, details) {
        let log = `[${timestamp}] ERROR: ${message}`;
        if (details.stack)    log += `\nStack: ${details.stack}`;
        if (details.endpoint) log += `\nEndpoint: ${details.endpoint}`;
        if (details.userId)   log += `\nUserID: ${details.userId}`;
        return log;
    }

    /**
     * Escribe en archivo de log
     * @private
     */
    static _writeToFile(content) {
        const logDir = path.join(__dirname, '../../logs');
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
        const logFile = path.join(logDir, 'errors.log');
        fs.appendFileSync(logFile, content + '\n', 'utf8');
    }

    /**
     * Guarda error en base de datos
     * @private
     */
    static async _saveToDatabase(timestamp, message, details) {
        await sequelize.query(
            `INSERT INTO TBL_MS_ERROR_LOG (
                FECHA,
                MENSAJE,
                STACK_TRACE,
                ENDPOINT,
                ID_USUARIO,
                METODO_HTTP,
                IP_ORIGEN
            ) VALUES (
                :timestamp,
                :message,
                :stack,
                :endpoint,
                :userId,
                :method,
                :ip
            )`,
            {
                replacements: {
                    timestamp,
                    message,
                    stack: details.stack || null,
                    endpoint: details.endpoint || null,
                    userId: details.userId || null,
                    method: details.method || null,
                    ip: details.ip || null
                }
            }
        );
    }

    /**
     * Envía notificaciones de errores críticos
     * @param {string} errorMessage
     */
    static async notifyCriticalError(errorMessage) {
        if (process.env.NOTIFY_CRITICAL_ERRORS === 'true') {
            console.error(`[CRITICAL ERROR NOTIFICATION] ${errorMessage}`);
        }
    }
}

// Exportar sólo la función logError, ligada al contexto de la clase
module.exports = {
    logError: ErrorService.logError.bind(ErrorService)
};
