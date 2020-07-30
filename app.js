var path = require("path");
var http = require("http");
var express = require("express");
var socket = require("socket.io");
var Filter = require("bad-words");

var { generateMessage, generateLocation } = require("./utils/messages");

var { addUser, removeUser, getUser, getUsersInRoom } = require("./utils/users");

var app = express();
var server = http.createServer(app);
var io = socket(server);


var PORT = process.env.PORT || 3000;
var publicDirectoryPath = path.join(__dirname, "public");

app.use(express.static(publicDirectoryPath));

// socket.emit("updatedCount", count); // socket.emit() emits the event to a single connection
//io.emit("updatedCount", count); // io.emit() emits the event to every single connection that is available
// socket.broadcast.emit("message", "A new user has joined!") // emits the event to every single connection available 
//except the client who is joining(that particular connection)

// io.to(roomName).emit() // emits the event to every single connection available in the specific room
// socket.broadcast.to(roomName).emit() // same as socket.broadcast.emit() but specific to a given roomName



io.on("connection", function(socket) {
    console.log("New Web-Socket Connection!");

    // socket.emit("message", generateMessage("Welcome!"))
    // socket.broadcast.emit("message", generateMessage("A new user has joined!"))

    socket.on("join", function(queryObject, callback) {
        var { username, room } = queryObject;

        // add the user to the users array
        var result = addUser(socket.id, username, room);

        if (result.error) {
            return callback(result.error);
        }

        socket.join(result.room);

        socket.emit("message", generateMessage(`Welcome ${result.username}!`, "Admin"))
        socket.broadcast.to(result.room).emit("message", generateMessage(`${result.username} has joined!`, "Admin"));

        // send users(in a specific room) array to client
        io.to(result.room).emit("userList", {
            room: result.room,
            usersInRoom: getUsersInRoom(result.room)
        });

        callback()
    })

    socket.on("sendMessage", function(message, callback) {

        var filter = new Filter();
        if (filter.isProfane(message)) {
            return callback("Profane messages are not allowed!");
        }

        var user = getUser(socket.id);


        io.to(user.room).emit("message", generateMessage(message, user.username));
        callback("Message Delivered!"); // for acknowledging that server received the message sent by client.
    })

    socket.on("shareLocation", function(coords, callback) {
        var { latitude, longitude } = coords;

        var user = getUser(socket.id);

        io.to(user.room).emit("locationMessage", generateLocation(`https://www.google.com/maps?q=${latitude},${longitude}`, user.username));

        callback("Location shared!")
    })

    socket.on("disconnect", function() { // when a connected client gets disconnected

        // remove the user from users array
        var removedUser = removeUser(socket.id);

        if (removedUser) {

            io.to(removedUser.room).emit("message", generateMessage(`${removedUser.username} has left!`, "Admin"));

            // send users(in a specific room) array to client
            io.to(removedUser.room).emit("userList", {
                room: removedUser.room,
                usersInRoom: getUsersInRoom(removedUser.room)
            });
        }
    })
})

server.listen(PORT, function(req, res) {
    console.log(`SERVER STARTED AT PORT ${PORT}...!`)
})