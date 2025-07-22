// backend/src/models/object.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Objeto = sequelize.define('Objeto', {
  atr_id_objetos: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  atr_objeto: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  atr_descripcion: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  atr_tipo_objeto: {
    type: DataTypes.STRING(15),
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
  },
  atr_estado_objeto: {
  type: DataTypes.STRING(20),
  allowNull: false,
  defaultValue: 'ACTIVO'
}

}, {
  tableName: 'tbl_objetos',
  timestamps: false,
  underscored: true
});

module.exports = Objeto;
