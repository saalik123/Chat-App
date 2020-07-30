var generateMessage = function(message, username) {
    return {
        text: message,
        username: username,
        createdAt: new Date().getTime()
    }
}

var generateLocation = function(url, username) {
    return {
        url: url,
        username: username,
        createdAt: new Date().getTime()
    }
}

module.exports = {
    generateMessage,
    generateLocation
}