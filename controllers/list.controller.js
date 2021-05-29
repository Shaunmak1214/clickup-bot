const axios = require('axios');
const { BaseAPI } = require('../config')

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

module.exports = {
    getFolderlessList
}