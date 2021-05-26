const { db } = require('../config');

const run = () => {
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
}

module.exports = {
    run
}