const { Sequelize } = require('@sequelize/core');
const { PostgresDialect } = require('@sequelize/postgres');

const sequelize = new Sequelize({
    dialect: PostgresDialect,
    database: 'employeemanagement',
    user: 'postgres',
    password: 'postgres',
    host: 'localhost',
    port: 5432,
    clientMinMessages: 'notice',
});

async function connectDatabase() {
    try {
        await sequelize.authenticate();
        await sequelize.sync({ alter: true })
        console.log('Db connection established Successfully');
    }
    catch (err) {
        console.log(err);
    }
}

module.exports = {
    sequelize,
    connectDatabase
};