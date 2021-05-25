const sendToChannel = async(channel, message) => {
    channel.channel.send(message)
}

const sendToPrivate = async(client, discord_user_id, message) => {
    client.users.fetch(discord_user_id, false).then((user) => {
        user.send(message);
    });
}

module.exports = {
    sendToChannel,
    sendToPrivate
}