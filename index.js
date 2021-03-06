const express = require('express');
const axios = require('axios');
const Discord = require('discord.js');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
require('dotenv').config()

const { user, team, space, list, task } = require('./controllers/index')
const { prefix, BaseAPI } = require('./config');
const { dbActions } = require('./actions')
const { help, send } = require('./commands')

// Initiate Database Actions (Authenctication and Synching)
dbActions.run();

let app = express();

// set the view engine to ejs
app.set('views', './views');
app.set('view engine', 'ejs');
app.use(bodyParser.json())
app.use(cookieParser());

/* ============================= Routes to ejs templating  ============================= */
app.use(express.static( "public" ));

app.get('/auth/redirect', function(req, res) {
    var discord_user_id = req.query.discord_user_id
    res.cookie('discord_user_id', `${discord_user_id}`, { maxAge: 900000, httpOnly: true });
    res.redirect(`https://app.clickup.com/api?client_id=${process.env.CLICKUP_CLIENTID}&redirect_uri=https://clickup-task-bot.herokuapp.com/auth/callback`)
})

app.get('/auth/callback', async function(req, res) {
    let discord_user_id = req.cookies['discord_user_id'];
    console.log(`Discord User Id: ${discord_user_id}`)

    if(req.query.code){

        let access_token = await axios.post(`${BaseAPI}oauth/token?client_id=${process.env.CLICKUP_CLIENTID}&client_secret=${process.env.CLICKUP_CLIENTSECRET}&code=${req.query.code}`)
            .then((res) => {
                return res.data.access_token
            })
            .catch((err) => {
                console.log(err)
                return null;
            })

        let tokenSaved = await user.createUser(discord_user_id, access_token)
            .then((res) => {
                if(res === 1){
                    return 'User is already registered'
                }else if(res){
                    return 'Account Registered'
                }else if(!res){
                    return 'Account Not Registered'
                }
            })
            .catch((err) => {
                console.log(err)
                return null;
            })

        if(access_token && tokenSaved){
            /* res.clearCookie('discord_user_id') */
            res.render('callback', { access_token: `${access_token}`, token_saved: tokenSaved });
        }
        
    }else{
        res.render('callback', { access_token: `No Code Available`, token_saved: "Not Registered" });
    }

});

app.get('/', function(req, res) {
    res.send('This is clickup-bot');
});

app.use('/v1', require('./routes/index'));

app.use((req, res, next) => {
    res.status(404).send('We think you are lost!')
})

app.use((err, req, res, next) => {
    console.error(err.stack)
})

/* ============================= Discord Client Commands ============================= */
const client = new Discord.Client();

client.on("ready", () =>{
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setPresence({
        status: "idle",  // You can show online, idle... Do not disturb is dnd
        game: {
            name: "!help",  // The message shown
            type: "WATCHING" // PLAYING, WATCHING, LISTENING, STREAMING,
        }
    });
    client.user.setActivity("Managing Tasks"); 
});

client.on('message', async message => {
    if(message.content.includes(`${prefix}help`)){
        help(message)
    }else if(message.content.includes(`${prefix}teams`)){
        let access_token = await user.getAccessTokenViaDiscordId(message.author.id)
        if(!access_token){
            send.sendLoginGuidePrivately(client, message.author.id)
            return;
        }
        let teams = await team.getTeams(access_token)
        send.sendTeamsInfoToChannel(message, teams)
    }else if(message.content.includes(`${prefix}spaces`)){
        let access_token = await user.getAccessTokenViaDiscordId(message.author.id)
        if(!access_token){
            send.sendLoginGuidePrivately(client, message.author.id)
            return;
        }
        let teams = await team.getTeams(access_token)
        let spaces = await space.getSpaceByTeam(access_token, teams)
        send.sendSpacesInfoToChannel(message, spaces)
    }else if(message.content.includes(`${prefix}lists`)){
        let access_token = await user.getAccessTokenViaDiscordId(message.author.id)
        if(!access_token){
            send.sendLoginGuidePrivately(client, message.author.id)
            return;
        }
        let teams = await team.getTeams(access_token)
        let spaces = await space.getSpaceByTeam(access_token, teams)
        let lists = await list.getFolderlessList(access_token, spaces)
        send.sendListsInfoToChannel(message, lists)
    }else if(message.content.includes(`${prefix}tasks`)){
        let access_token = await user.getAccessTokenViaDiscordId(message.author.id)
        if(!access_token){
            send.sendLoginGuidePrivately(client, message.author.id)
            return;
        }
        let teams = await team.getTeams(access_token)
        let spaces = await space.getSpaceByTeam(access_token, teams)
        let lists = await list.getFolderlessList(access_token, spaces)
        let tasks = await task.getTasksFromList(access_token, lists)
        send.sendTasksInfoToChannel(message, tasks)
    }else if(message.content.includes(`${prefix}allLists`)){
        let access_token = await user.getAccessTokenViaDiscordId(message.author.id)
        if(!access_token){
            send.sendLoginGuidePrivately(client, message.author.id)
            return;
        }
        list.getAllAvailableListsFromUser(access_token);
    }else if(message.content.includes(`${prefix}login`)){
        send.sendLoginGuidePrivately(client, message.author.id)
    }else if(message.content.includes(`${prefix}subscribe`)){
        let subscribed = await user.updateSubscribtion(message.author.id, true)
        let sendMessage = `${message.author.username} is now a subscribed user!`;
        if(subscribed){
            send.sendToChannel(message, sendMessage)
        }
    }
});

client.login(process.env.TOKEN);

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.info(`Server has started on ${PORT}`))

