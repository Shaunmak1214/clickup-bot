const axios = require('axios');
const { BaseAPI } = require('../config')

const getTeams = async(access_token) => {

    var config = {
        method: 'get',
        url: `${BaseAPI}team`,
        headers: { 
            'Authorization': `${access_token}`
        }
    };
    
    let teams = await axios(config)
        .then(function (res) {
            return res.data.teams//teams array
        })
        .catch(function (err) {
            console.log(err)
            return null
        });

    return teams
}

module.exports = {
    getTeams
}