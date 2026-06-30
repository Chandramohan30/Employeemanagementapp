const { DataTypes } = require('@sequelize/core');
const { sequelize } = require("../config/db.js");

const employeemodel = sequelize.define(
    "employee",
    {
        empid: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4
        },
        empname: {
            type: DataTypes.STRING,
            allowNull: false
        },
        empdateofbirth:{
            type:DataTypes.DATE
        },
        empemail: {
            type: DataTypes.STRING
        },
        empphone: {
            type: DataTypes.STRING
        },
        empgender:
        {
            type:DataTypes.STRING
        },
        status: {
            type: DataTypes.ENUM("Active", "Inactive"),
            defaultValue: "Inactive"
        }
    }
);

module.exports = {
    employeemodel
};