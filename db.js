const { Sequelize } = require("sequelize")

module.exports = new Sequelize (
    `telega_bot`,
    `telega_bot`,
    `Snsrhw0v`,
    {
        host: `192.168.198.128`,
        port: `5432`,
        dialect: `postgres`
    }
)