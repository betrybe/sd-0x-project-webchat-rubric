const http = require('http');
const express = require('express');
const socketIo = require('socket.io');
const cors = require('cors');
const faker = require('faker');
require('dotenv').config();

const helpers = require('./helpers/stateInMemory');
const messageControler = require('./controllers/messageControler');

const PORT = process.env.PORT || 3000;

const app = express();
const httpServer = http.createServer(app);
const io = socketIo(httpServer);

app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static(`${__dirname}/public/`));

app.set('view engine', 'ejs');
app.set('views', './views');

app.get('/', messageControler.getAllMessages);

const initSocket = (currentSocket) => {
  currentSocket.user = { nickname: faker.name.firstName() };

  helpers.addNewUserInMemory(currentSocket.user);
  currentSocket.emit('myNickname', { myNickname: currentSocket.user.nickname, peopleOnline: helpers.getUsersInMemory() });
  currentSocket.broadcast.emit('newUser', currentSocket.user.nickname);
}

io.on('connection', (socket) => {
  
  initSocket(socket);

  socket.on('message', async (data) => {
    try {
      const result = await messageControler.saveMessage(data);
      const strEmit = `${result.date} - ${result.nickname}: ${result.chatMessage}`;
      io.emit('message', strEmit);
    } catch (error) {
      io.emit('message', 'server disconnect :(');
    }
  });

  socket.on('changeNick', (newNickname) => {
    socket.broadcast.emit('updateNickUser', { newNickname, oldNickname: socket.user.nickname})
    socket.user.nickname = newNickname;
  });

  socket.on('disconnect', () => {
    helpers.removeUserInMemory(socket.user);
    socket.broadcast.emit('offline', socket.user.nickname);
  });
});

httpServer.listen(PORT, () => console.log(`RUN SERVER 127.0.0.1:${PORT}`));
