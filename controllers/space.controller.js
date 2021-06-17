const axios = require('axios');
const { BaseAPI } = require('../config')

const getSpaceByTeam = async(access_token, teams) => {
    if(teams.length > 0){
        let spacesArr = []
        let waitTeams = new Promise((resolve, reject) => {
            teams.forEach( async(team, index, array) => {
                var config = {
                    method: 'get',
                    url: `${BaseAPI}team/${team.id}/space?archived=false`,
                    headers: { 
                        'Authorization': `${access_token}`
                    }
                };
    
                let space = await axios(config)
                if(space){
                    space.data.spaces.forEach(el => {
                        spacesArr.push(el)
                    })
                }else{
                    spaces.push({
                        status: 'Error',
                        message: space,
                        team: team.id
                    })
                }

                if (index === array.length -1) resolve(); //to resolve
            });
        })
        return waitTeams.then(() => {
            return spacesArr
        })
    }else{
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
}

module.exports = {
    getSpaceByTeam
}