const sendToChannel = async(channel, message) => {
    channel.channel.send(message)
}

module.exports = {
    sendToChannel
}