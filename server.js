const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(__dirname));

// fake database (resets on restart)
const users = {};

io.on("connection", (socket) => {
    let loggedInUser = null;

    // SIGN UP
    socket.on("signup", (data, cb) => {
        const { username, password } = data;

        if (users[username]) {
            return cb({ success: false, message: "Username already exists" });
        }

        users[username] = password;
        cb({ success: true, message: "Account created!" });
    });

    // LOGIN
    socket.on("login", (data, cb) => {
        const { username, password } = data;

        if (users[username] && users[username] === password) {
            loggedInUser = username;
            return cb({ success: true });
        }

        cb({ success: false, message: "Invalid username or password" });
    });

    // CHAT MESSAGE
    socket.on("chat message", (msg) => {
        if (!loggedInUser) return;

        io.emit("chat message", {
            user: loggedInUser,
            text: msg,
            time: new Date().toLocaleTimeString()
        });
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log("Server running on " + PORT);
});