const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

// Serve static files from public directory
app.use(express.static('public'));

let waitingUser = null;

io.on('connection', (socket) => {
    console.log('A user connected: ' + socket.id);

    socket.on('join', () => {
        if (waitingUser) {
            // If there's a waiting user, pair them
            const peerId = waitingUser;
            waitingUser = null;
            io.to(socket.id).emit('peer', { peerId });
            io.to(peerId).emit('peer', { peerId: socket.id });
        } else {
            // Otherwise, put this user in the waiting queue
            waitingUser = socket.id;
        }
    });

    socket.on('offer', (data) => {
        io.to(data.peerId).emit('offer', data.offer);
    });

    socket.on('answer', (data) => {
        io.to(data.peerId).emit('answer', data.answer);
    });

    socket.on('candidate', (data) => {
        io.to(data.peerId).emit('candidate', data.candidate);
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected: ' + socket.id);
        if (waitingUser === socket.id) {
            waitingUser = null;
        } else {
            socket.broadcast.emit('peerDisconnected', { peerId: socket.id });
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
