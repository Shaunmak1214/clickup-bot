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

const getAllUser = async() => {

}   

const getAllSubscribedUser = async() => {
    const subscribedUsers = await User.findAll({
        where:{
            subscribed: true
        }
    })

    let users = []

    if(subscribedUsers.length > 0){
        subscribedUsers.forEach(user => {
            if(user.dataValues.access_token.length > 0){
                users.push({
                    user_id: user.dataValues.user_id,
                    discord_user_id: user.dataValues.discord_user_id,
                    access_token: user.dataValues.access_token
                })
            }else{
                return;
            }
        });
        return users
    }else{
        return null;
    }
}

module.exports = {
    createUser,
    getAccessTokenViaDiscordId,
    getAllSubscribedUser
}