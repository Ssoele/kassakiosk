"use strict"
var config  = require("./config.json");
var mysql   = require("mysql");
var express = require('express');
var app     = express();
var server  = require("http").createServer(app);
var ejs     = require("ejs");
var io      = require("socket.io")(server);

var users   = [];

server.listen(3000);

app.set("view engine", "ejs");
app.set("case sensitive routing", true);


// =====START=====
//      MySQL
// =====START=====
var connection = mysql.createConnection({
    host: config.host,
    user: config.user,
    password: config.pass,
    database: "node"
});
connection.connect();

app.use("*", function (req, res, next) {
    connection.query("INSERT INTO log SET log = ?", [req.originalUrl], next);
});
// ======END======
//      MySQL
// ======END======





io.on('connection', function(socket) {
    socket.on('login', function(data) {
        var userId = users.length;
        var username = data.username;
        users.forEach(function(user) {
            user.socket.emit('client-connected', {
                userId: userId,
                username: username
            });
        });
        users.push({
            userId: userId,
            username: username,
            connected: true,
            socket: socket
        });
        socket.emit('login-acknowledged', {
            connected: true,
            userId: userId,
            username: username,
            users: getUsers()
        });
    });
    socket.on('message', function(data) {
        var userId = -1;
        users.forEach(function(user) {
            if(user.socket == socket) {
                userId = user.userId;
            }
        });
        users.forEach(function(user) {
            user.socket.emit('message-received', {
                userId: userId,
                message: data.message
            });
        });
    });
});

function getUsers() {
    var userList = [];
    users.forEach(function(user) {
        userList.push({
            userId: user.userId,
            username: user.username
        });
    });
    return userList;
}

app.use("/css", express.static(__dirname + "/public/css"));
app.use("/images", express.static(__dirname + "/public/images"));
app.use("/fonts", express.static(__dirname + "/public/fonts"));
app.use("/js", express.static(__dirname + "/public/js"));

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/index.html");
});

app.get("/chat", function(req, res) {
    res.render(__dirname + "/pages/chat");
});

app.get("/log", function(req, res) {
    connection.query("SELECT * FROM log ORDER BY date DESC LIMIT ?", [10], function(err, result) {
        if (err) {
            //res.write(err);
            console.log(err);
        } else {
            res.render(__dirname + "/pages/log", {
                logs: result
            });
        }
    });
});

app.use(function (req, res) {
    res.status(404).end("404 Page is choud!");
});