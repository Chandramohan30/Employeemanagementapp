const { DataTypes } = require('@sequelize/core');
const { sequelize } = require("../config/db.js");
const { employeemodel } = require('./employeemodel.js');

const assertmodel=sequelize.define(
    'asserts',
    {
       assertid:{
        type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4
       },
       empid: {
  type: DataTypes.UUID
},
       asserts:{
        type:DataTypes.JSONB
       }

})

module.exports={
    assertmodel
}




