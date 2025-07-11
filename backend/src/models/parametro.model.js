// backend/src/models/parametro.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Parametro = sequelize.define('tbl_ms_parametros', {
  atr_id_parametro: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'atr_id_parametro'
  },
  atr_parametro: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'atr_parametro'
  },
  atr_valor: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'atr_valor'
  },
  atr_id_usuario: {
    type: DataTypes.INTEGER,
    field: 'atr_id_usuario'
  },
  atr_creado_por: {
    type: DataTypes.STRING(15),
    field: 'atr_creado_por'
  },
  atr_fecha_creacion: {
    type: DataTypes.DATE,
    field: 'atr_fecha_creacion'
  },
  atr_modificado_por: {
    type: DataTypes.STRING(15),
    field: 'atr_modificado_por'
  },
  atr_fecha_modificacion: {
    type: DataTypes.DATE,
    field: 'atr_fecha_modificacion'
  }
}, {
  tableName: 'tbl_ms_parametros',
  freezeTableName: true,
  timestamps: false
});

module.exports = Parametro;
