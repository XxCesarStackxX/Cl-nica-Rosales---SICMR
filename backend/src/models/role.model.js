// backend/src/models/role.model.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Role = sequelize.define(
  'Role',
  {
    atr_id_rol: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    atr_nombre_rol: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true,
    },
    atr_descripcion: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    atr_creado_por: {
      type: DataTypes.STRING(15),
      allowNull: true,
    },
    atr_modificado_por: {
      type: DataTypes.STRING(15),
      allowNull: true,
    },
    atr_id_bitacora: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    atr_estado_rol: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'ACTIVO',
    }
  },
  {
    tableName: 'tbl_ms_roles',
    timestamps: true,
    paranoid: false,
    createdAt: 'atr_fecha_creacion',
    updatedAt: 'atr_fecha_modificacion'
  }
);

module.exports = Role;
