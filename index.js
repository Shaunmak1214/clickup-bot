const express = require('express');
const axios = require('axios');
const Discord = require('discord.js');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
require('dotenv').config()

const { user } = require('./controllers/index')
const { prefix, BaseAPI, db } = require('./config');
const { help, send } = require('./commands')

// Database Authentication
db.sync({ alter:true })
.then((synched) => {
    console.log(`${synched} All models were synchronized successfully.`)
})
.catch((err) => {
    console.log(err)
})

db.authenticate()
    .then(() => console.log('Database connected...'))
    .catch(err => console.log('Error: ' + err))

function parseCookies(str) {
    let rx = /([^;=\s]*)=([^;]*)/g;
    let obj = { };
    for ( let m ; m = rx.exec(str) ; )
        obj[ m[1] ] = decodeURIComponent( m[2] );
    return obj;
}

let app = express();

// set the view engine to ejs
app.set('views', './views');
app.set('view engine', 'ejs');
app.use(bodyParser.json())
app.use(cookieParser());

/* ============================= Routes to ejs templating  ============================= */
app.use( express.static( "public" ) );

app.get('/', function(req, res) {
    res.send('This is clickup-bot');
});

app.get('/auth/redirect', function(req, res) {

    console.log(req.query.discord_user_id)
    var discord_user_id = req.query.discord_user_id
    console.log(`This is from query ${discord_user_id}`)
    var cookie = req.cookies.discord_user_id;
    res.cookie('discord_user_id',discord_user_id, { maxAge: 900000 });

    res.writeHead(301,{
        Location: `https://app.clickup.com/api?client_id=${process.env.CLICKUP_CLIENTID}&redirect_uri=https://click-up-bot.herokuapp.com/auth/callback`
    });

    res.end();
})

app.get('/auth/callback', async function(req, res) {

    let status = null;
    let discord_user_id = parseCookies( req.headers.cookie ).discord_user_id;
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
                res.clearCookie('discord_user_id')
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
            res.send('callback', { access_token: `${access_token}`, token_saved: tokenSaved });
        }
        
    }else{
        status = "No Code Available"
    }

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
        
    }else if(message.content.startsWith(`${prefix}login`)){
        const embed = new Discord.MessageEmbed()
            .setColor('#ff6a00')
            .setTitle('Welcome to the Login Lobby | Powered by ClickUp-Bot')
            .setAuthor('ClickUp-Bot', 'https://i.imgur.com/wSTFkRM.png', 'https://discord.js.org')
            .setDescription('This is the authentication guide to bring your tasks management experience to the MOON')
            .setThumbnail('https://i.imgur.com/wSTFkRM.png')
            .addFields(
                { name: 'Login with this link: ', value: `https://click-up-bot.herokuapp.com/auth/redirect?discord_user_id=${message.author.id}` },
                { name: '\u200B', value: '\u200B' },
            )
            .setImage('https://i.imgur.com/wSTFkRM.png')
            .setTimestamp()

        send.sendToPrivate(client, message.author.id, embed)
    }
});

client.login(process.env.TOKEN);

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.info(`Server has started on ${PORT}`))

