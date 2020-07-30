var socket = io();

// Elements
var $messageForm = document.querySelector("#form-message");
var $messageFormInput = $messageForm.querySelector("input"); // document.getElementById("message");
var $messageFormButton = $messageForm.querySelector("button"); // document.getElementById("send-message-button");
var $sendLocationButton = document.getElementById("share-location");
var $messages = document.getElementById("messages");
var $sidebar = document.getElementById("sidebar");

// Templates
var messageTemplate = document.getElementById("message-template").innerHTML;
var locationTemplate = document.getElementById("location-message-template").innerHTML;
var sidebarTemplate = document.getElementById("sidebar-template").innerHTML;

// Query String - parsing queryString
var queryObject = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

var autoScroll = function() {

    // always scroll to the bottom
    $messages.scrollTop = $messages.scrollHeight;
}


socket.on("message", function(message) {
    console.log(message);
    var html = Mustache.render(messageTemplate, {
        message: message.text,
        username: message.username,
        createdAt: moment(message.createdAt).format("h:mm a")
    });
    $messages.insertAdjacentHTML("beforeend", html);

    autoScroll();
})

$messageForm.addEventListener("submit", function(e) {
    e.preventDefault();
    // disable sendButton
    $messageFormButton.setAttribute("disabled", "disabled");

    var message = e.target.elements.message.value;
    socket.emit("sendMessage", message, function(ack) {
        // the function is for receiving acknowledgement from the client that the server received the message sent by client
        if (ack.error) {
            alert(ack.error);
        }

        // enable sendButton
        $messageFormButton.removeAttribute("disabled");

        $messageFormInput.value = "";
        $messageFormInput.focus();

    });
})


$sendLocationButton.addEventListener("click", function(e) {
    if (!navigator.geolocation) {
        return alert("Geolocation feature is not supported by your browser!");
    }

    // disable sendLocationButton
    $sendLocationButton.setAttribute("disabled", "disabled");

    navigator.geolocation.getCurrentPosition(function(position) {
        var latitude = position.coords.latitude;
        var longitude = position.coords.longitude;

        socket.emit("shareLocation", {
            latitude,
            longitude
        }, function(ack) {
            console.log(ack);

            // enable sendLocationButton
            $sendLocationButton.removeAttribute("disabled");
        });
    })
})

socket.on("locationMessage", function(message) {
    console.log(message);
    var html = Mustache.render(locationTemplate, {
        url: message.url,
        username: message.username,
        createdAt: moment(message.createdAt).format("h:mm a")
    });
    $messages.insertAdjacentHTML("beforeend", html);

    autoScroll();
})

socket.emit("join", queryObject, function(ack) {
    if (ack) { // error
        alert(ack);
        location.href = "/";
    }
});


socket.on("userList", function(usersData) {
    var room = usersData.room.toUpperCase();
    var users = usersData.usersInRoom;

    var html = Mustache.render(sidebarTemplate, {
        room: room,
        users: users
    })

    $sidebar.innerHTML = html;

})