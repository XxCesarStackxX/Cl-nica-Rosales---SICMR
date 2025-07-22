// backend/src/models/permiso.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Permiso = sequelize.define('Permiso', {
  atr_id_rol: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false
  },
  atr_id_objeto: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false
  },
  atr_permiso_insercion: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  atr_permiso_eliminacion: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  atr_permiso_actualizacion: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  atr_permiso_consultar: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  atr_creado_por: {
    type: DataTypes.STRING(15),
    allowNull: true
  },
  atr_fecha_creacion: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  atr_modificado_por: {
    type: DataTypes.STRING(15),
    allowNull: true
  },
  atr_fecha_modificacion: {
    type: DataTypes.DATEONLY,
    allowNull: true
  }
}, {
  tableName: 'tbl_permisos',
  timestamps: false,
  underscored: true
});

module.exports = Permiso;
