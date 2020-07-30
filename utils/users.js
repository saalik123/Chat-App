var users = [];


var addUser = function(id, username, room) {

    // data sanitization
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    // validate the data
    if (!username || !room) {
        return { error: "Username and room are required!" };
    }

    // check for existing user in a room
    // every username and room combination should be unique
    var existingUser = users.find(function(user) {
        return user.username === username && user.room === room;
    })

    if (existingUser) {
        return { error: "User with that username already exists!" }
    }

    // create userObject
    var userObject = { id, username, room };

    // add userObject to users array
    users.push(userObject);

    return userObject;
}

var removeUser = function(id) {

    // find index of user to be removed
    var index = users.findIndex(function(user) {
        return user.id === id
    });

    // remove the user from array
    if (index > -1) {
        return users.splice(index, 1)[0];
    }
}

var getUser = function(id) {

    var foundUser = users.find(function(user) {
        return user.id === id
    })

    return foundUser;
}

var getUsersInRoom = function(room) {

    room = room.trim().toLowerCase();

    var usersInRoom = users.filter(function(user) {
        return user.room === room
    })

    return usersInRoom
}


module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}