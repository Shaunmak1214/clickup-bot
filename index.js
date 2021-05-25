const express = require('express');
const axios = require('axios');
const Discord = require('discord.js');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
require('dotenv').config()

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

let app = express();

// set the view engine to ejs
app.set('views', './views');
app.set('view engine', 'ejs');
app.use(bodyParser.json())
app.use(cookieParser());

app.get('/', function(req, res) {
    res.send('This is clickup-bot');
});

app.get('/authorize', function(req, res) {
    res.send('This is clickup-bot, authorization route');
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

    }
});

client.login(process.env.TOKEN);

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.info(`Server has started on ${PORT}`))

