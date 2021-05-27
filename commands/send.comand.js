const Discord = require('discord.js');

const sendToChannel = async(channel, message) => {
    channel.channel.send(message)
}

const sendTeamsInfoToChannel = async(channel, teams) => {
    
    const embed = new Discord.MessageEmbed()
        .setColor(`#ff6a00`)
        .setTitle(`Teams`)
        .setAuthor('ClickUp-Bot', 'https://i.imgur.com/wSTFkRM.png', 'https://discord.js.org')
        .setDescription('Lists of your teams')
        .setTimestamp()

    teams.forEach(team => {
        embed.addFields(
            { name: '\u200B', value: '\u200B' },
            { name: 'Team"s Name:', value: `${team.name}` },
            { name: '\u200B', value: '\u200B' },
        )
    });

    channel.channel.send(embed)
}

const sendToPrivate = async(client, discord_user_id, message) => {
    client.users.fetch(discord_user_id, false).then((user) => {
        user.send(message);
    });
}

const sendLoginGuidePrivately = async(client, discord_user_id) => {

    const embed = new Discord.MessageEmbed()
        .setColor('#ff6a00')
        .setTitle('Welcome to the Login Lobby | Powered by ClickUp-Bot')
        .setAuthor('ClickUp-Bot', 'https://i.imgur.com/wSTFkRM.png', 'https://discord.js.org')
        .setDescription('This is the authentication guide to bring your tasks management experience to the MOON')
        .addFields(
            { name: '\u200B', value: '\u200B' },
            { name: 'Login with this link: ', value: `http://clickup-task-bot.herokuapp.com/auth/redirect?discord_user_id=${message.author.id}` },
            { name: '\u200B', value: '\u200B' },
        )
        .setTimestamp()

    client.users.fetch(discord_user_id, false).then((user) => {
        user.send(embed);
    });
}

module.exports = {
    sendToChannel,
    sendTeamsInfoToChannel,
    sendToPrivate,
    sendLoginGuidePrivately
}