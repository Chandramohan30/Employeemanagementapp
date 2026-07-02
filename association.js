const { employeemodel } = require('./models/employeemodel.js')
const { assertmodel } = require("./models/assertmodel.js")


employeemodel.hasMany(assertmodel, {
  foreignKey: "empid"
});

assertmodel.belongsTo(employeemodel, {
  foreignKey: "empid"
});