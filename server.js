'use strict';

const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const shortid = require('shortid');

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

  const joinRoom = room => {
    socket.join(room, () => {
      socket.to(room).emit('message', { text: 'another user has joined! type a message to say hi' });
    });
  };

  const assignRoom = prevRoom => {
    const availableRoom = getRooms().find(room => (
      room !== prevRoom && getUsersInRoom(room).length === 1
    ));

    if (availableRoom) {
      joinRoom(availableRoom);
      socket.emit('message', { text: 'welcome to the chatroom! type a message to say hi' });
    } else {
      const room = shortid.generate();
      joinRoom(room);
      if (prevRoom) {
        socket.emit('message', { text: 'you\'ve hopped to a new room!' });
      } else {
        socket.emit('message', { text: 'welcome to the chatroom!' });
      }
      socket.emit('message', { text: 'waiting for another user to join...' });
    }
  };

  assignRoom();

  socket.on('message', message => {
    io.to(getCurrRoom()).emit('message', message);
  });

  socket.on('hop', () => {
    const currRoom = getCurrRoom();
    socket.leave(currRoom, () => {
      socket.to(currRoom).emit('message', { text: 'user has hopped away :(' });
      socket.to(currRoom).emit('message', { text: 'waiting for another user to join...' });
      assignRoom(currRoom);
    });
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

server.listen(port, () => {
  console.log(`listening on port ${port}`);
});
