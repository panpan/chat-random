'use strict';

const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const shortid = require('shortid');
const path = require('path');

const port = 3000;

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

io.on('connection', socket => {
  console.log('user connected');

  const getRooms = () => {
    const roomsWithIDs = Object.keys(socket.adapter.rooms); // all rooms including socket ids
    const socketIDs = Object.keys(io.sockets.sockets); // all connected socket ids
    const rooms = roomsWithIDs.filter(room => !socketIDs.includes(room));
    return rooms;
  };

  const getCurrRoom = () => {
    const socketRooms = Object.keys(socket.rooms); // all socket's rooms including socket id room
    return socketRooms.filter(room => room !== socket.id)[0];
  };

  const getUsersInRoom = room => Object.keys(socket.adapter.rooms[room].sockets);

  const joinRoom = (username, room) => {
    socket.join(room, () => {
      socket.to(room).emit('message', { text: `${username} has joined! type a message to say hi` });
    });
  };

  const assignRoom = (username, prevRoom) => {
    const availableRoom = getRooms().find(room => (
      room !== prevRoom && getUsersInRoom(room).length === 1
    ));

    if (availableRoom) {
      joinRoom(username, availableRoom);
      if (prevRoom) {
        socket.emit('message', { text: 'you\'ve hopped to a new room! type a message to say hi' });
      } else {
        socket.emit('message', { text: `welcome to the chatroom, ${username}! type a message to say hi` });
      }
    } else {
      const newRoom = shortid.generate();
      joinRoom(username, newRoom);
      if (prevRoom) {
        socket.emit('message', { text: 'you\'ve hopped to a new room!' });
      } else {
        socket.emit('message', { text: `welcome to the chatroom, ${username}!` });
      }
      socket.emit('message', { text: 'waiting for another user to join...' });
    }
  };

  socket.on('join', username => {
    assignRoom(username);
  });

  socket.on('message', message => {
    io.to(getCurrRoom()).emit('message', message);
  });

  socket.on('hop', username => {
    const prevRoom = getCurrRoom();
    socket.leave(prevRoom, () => {
      socket.to(prevRoom).emit('message', { text: `${username} has hopped away :(` });
      socket.to(prevRoom).emit('message', { text: 'waiting for another user to join...' });
      assignRoom(username, prevRoom);
    });
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/dist')));

  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/dist/index.html'));
  });
}

server.listen(port, () => {
  console.log(`listening on port ${port}`);
});
