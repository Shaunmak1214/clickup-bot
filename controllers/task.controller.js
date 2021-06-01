const axios = require('axios');
const { BaseAPI } = require('../config')

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

module.exports = {
    getTasksFromList
}