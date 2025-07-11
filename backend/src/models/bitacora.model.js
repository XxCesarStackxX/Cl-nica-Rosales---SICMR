// backend/src/models/bitacora.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Bitacora = sequelize.define('Bitacora', {
  id: {
    field: 'atr_id_bitacora',
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  fecha: {
    field: 'atr_fecha',
    type: DataTypes.DATE,
    allowNull: false
  },
  idUsuario: {
    field: 'atr_id_usuario',
    type: DataTypes.INTEGER,
    allowNull: false
  },
  idObjeto: {
    field: 'atr_id_objetos',    // <- nota el plural
    type: DataTypes.INTEGER,
    allowNull: false
  },
  accion: {
    field: 'atr_accion',        // <- coincide con tu DDL
    type: DataTypes.STRING(20),
    allowNull: false
  },
  descripcion: {
    field: 'atr_descripcion',
    type: DataTypes.STRING(100),
    allowNull: false
  }
}, {
  tableName: 'tbl_ms_bitacora',
  timestamps: false
});

module.exports = Bitacora;
