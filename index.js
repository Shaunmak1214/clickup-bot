const express = require('express');
const axios = require('axios');
const Discord = require('discord.js');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
require('dotenv').config()

const { user, team } = require('./controllers/index')
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
    if(message.content.startsWith(`${prefix}help`)){
        help(message)
    }else if(message.content.startsWith(`${prefix}tasks`)){
        let access_token = await user.getAccessTokenViaDiscordId(message.author.id)
        if(!access_token){
            send.sendLoginGuidePrivately(client, message.author.id)
            return;
        }
    }else if(message.content.startsWith(`${prefix}teams`)){
        let access_token = await user.getAccessTokenViaDiscordId(message.author.id)
        if(!access_token){
            send.sendLoginGuidePrivately(client, message.author.id)
            return;
        }
        let teams = await team.getTeams(access_token)
        send.sendTeamsInfoToChannel(message, teams)
    }else if(message.content.startsWith(`${prefix}login`)){
        send.sendLoginGuidePrivately(client, message.author.id)
    }
});

client.login(process.env.TOKEN);

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.info(`Server has started on ${PORT}`))

