const User = require('../models/user.model');

const createUser = async(discord_user_id, access_token) => {
    const userExisted = await User.findAll({
        where: {
            discord_user_id: `${discord_user_id}`
        }
    })

    if(userExisted.length > 0){
        return 1;
    }else {
        const newUser = await User.create({ discord_user_id, access_token })

        if(newUser) {
            return true
        }else{
            return null
        }
    }
}

const getAccessTokenViaDiscordId = async (discord_id) => {
    const access_token = await User.findAll({
        where: {
            discord_user_id: `${discord_id}`
        }
    })

    if(access_token.length > 0){
        return access_token[0].dataValues.access_token;
    }else{
        return null;
    }
}

module.exports = {
    createUser,
    getAccessTokenViaDiscordId
}