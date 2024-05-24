// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let users = [];
app.use(express.static(path.join(__dirname, 'public')));
io.on('connection', socket => {
    if (users.length < 2) {
        users.push(socket.id);

        if (users.length === 2) {
            io.to(users[0]).emit('call', users[1]);
            io.to(users[1]).emit('call', users[0]);
        }
    }

    socket.on('offer', data => {
        io.to(data.peerId).emit('offer', data.offer);
    });

    socket.on('answer', data => {
        io.to(data.peerId).emit('answer', data.answer);
    });

    socket.on('candidate', data => {
        io.to(data.peerId).emit('candidate', data.candidate);
    });

    socket.on('disconnect', () => {
        users = users.filter(userId => userId !== socket.id);
    });
});

server.listen(3000, () => console.log('Server is running on port 3000'));