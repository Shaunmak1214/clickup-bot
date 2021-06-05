const Discord = require('discord.js');
const axios = require('axios');
const { BaseAPI } = require('../config')

const { user, space, team, list, task } = require('./index')
const { send } = require('../commands')

const getDailyTasks = async(req, res) => {

    const client = new Discord.Client();
    client.login(process.env.TOKEN);

    client.on("ready", async() =>{
        console.log(`Logged in as ${client.user.tag}!`);

        let subbedUserArr = await user.getAllSubscribedUser();
        let noOfSent = 0;
        if(subbedUserArr.length > 0){
            let allSentPromise = new Promise((resolve, reject) => {
                subbedUserArr.forEach( async(user, index, array) => {
                    let teams = await team.getTeams(user.access_token)
                    let spaces = await space.getSpaceByTeam(user.access_token, teams)
                    let lists = await list.getFolderlessList(user.access_token, spaces)
                    let tasks = await task.getTasksFromListDueToday(user.access_token, lists)
                    
                    if(tasks.length > 0){
                        let sent = await send.sendDailyTasksPrivately(client, user.discord_user_id, tasks)
                        if(sent === true){
                            noOfSent++;
                        }
                    }
    
                    if (index === array.length -1) resolve();
                });
            })
    
            allSentPromise
                .then(() => {
                    res.send(`${noOfSent} discord users have recieved their daily tasks reminder`)
                })
                .catch((err) => {
                    console.log(err)
                })
            
        }else{
            res.send('No Subbed Users')
        }
    })
}

module.exports = {
    getDailyTasks
}