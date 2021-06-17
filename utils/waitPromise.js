const waitPromise = async(fn) => {
    let newPromise = new Promise((resolve, reject) => {
        fn()
    })
}

module.exports = { waitPromise }