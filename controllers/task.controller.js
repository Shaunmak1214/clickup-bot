const axios = require('axios');
const { BaseAPI } = require('../config')
var moment = require('moment');

const getTasksFromList = async(access_token, lists) => {
    var config = {
        method: 'get',
        url: `${BaseAPI}list/${lists[0].id}/task?archived=false`,
        headers: { 
            'Authorization': `${access_token}`
        }
    };

    let tasks = await axios(config)
        .then(function (res) {
            return res.data.tasks //tasks array
        })
        .catch(function (err) {
            console.log(err)
            return null
        });

    return tasks
}

const getTasksFromListDueToday = async(access_token, lists) => {
    var config = {
        method: 'get',
        url: `${BaseAPI}list/${lists[0].id}/task?archived=false`,
        headers: { 
            'Authorization': `${access_token}`
        }
    };

    let tasks = await axios(config)
        .then(function (res) {
            let tasksDueToday = [];
            res.data.tasks.forEach(task => {
                let dueIn = task.due_date - (new Date().valueOf())
                if(moment.duration(dueIn).asDays() <= 24 && moment.duration(dueIn).asDays() > 0){
                    tasksDueToday.push(task)
                }
            });

            return tasksDueToday
        })
        .catch(function (err) {
            console.log(err)
            return null
        });

    return tasks
}

module.exports = {
    getTasksFromList,
    getTasksFromListDueToday
}