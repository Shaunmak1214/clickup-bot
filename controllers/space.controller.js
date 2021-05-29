const axios = require('axios');
const { BaseAPI } = require('../config')

const getSpaceByTeam = async(access_token, teams) => {
    var config = {
        method: 'get',
        url: `${BaseAPI}team/${teams[0].id}/space?archived=false`,
        headers: { 
            'Authorization': `${access_token}`
        }
    };

    let spaces = await axios(config)
        .then(function (res) {
            return res.data.spaces //spaces array
        })
        .catch(function (err) {
            console.log(err)
            return null
        });

    return spaces
}

const getSpaceByTeams = async(access_token, teams) => {
    
}

module.exports = {
    getSpaceByTeam,
    getSpaceByTeams
}