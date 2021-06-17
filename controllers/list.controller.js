const axios = require('axios');
const { BaseAPI } = require('../config')
const { team, space } = require('./index')

const getFolderlessList = async(access_token, spaces) => {
    var config = {
        method: 'get',
        url: `${BaseAPI}space/${spaces[0].id}/list?archived=false`,
        headers: { 
            'Authorization': `${access_token}`
        }
    };

    let lists = await axios(config)
        .then(function (res) {
            return res.data.lists //lists array
        })
        .catch(function (err) {
            console.log(err)
            return null
        });

    return lists
}

const getAllAvailableListsFromUser = async(access_token) => {
    let teams = await team.getTeams(access_token);
    let spaces = await space.getSpaceByTeam(access_token, teams)
    if(spaces.length > 0){
        let listsArr = [];
        let waitSpaces = new Promise((resolve, reject) => {
            spaces.forEach( async(eachSpace, index, array) => {
                var config = {
                    method: 'get',
                    url: `${BaseAPI}space/${eachSpace.id}/list?archived=false`,
                    headers: { 
                        'Authorization': `${access_token}`
                    }
                };
    
                let list = await axios(config)
                if(list){
                    list.data.lists.forEach(el => {
                        listsArr.push(el)
                    })
                }else{
                    listsArr.push({
                        status: 'Error',
                        message: list,
                        space
                    })
                }

                if (index === array.length -1) resolve(); //to resolve
            });
        })
        waitSpaces.then(() => {
            console.log(listsArr)
        })
    }else{
        let lists = await getFolderlessList(access_token, spaces)
        console.log(lists)
    }
}

module.exports = {
    getFolderlessList,
    getAllAvailableListsFromUser
}