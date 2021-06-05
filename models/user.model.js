const Sequelize = require('sequelize');
const db = require('../config/database');

const User = db.define('user', {
    user_id:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    discord_user_id:{
        type: Sequelize.STRING,
    },
    access_token:{
        type: Sequelize.STRING,
    },
    refresh_token: {
        type: Sequelize.STRING,
    },
    subscribed: {
        type: Sequelize.BOOLEAN,
    }
})

module.exports = User;