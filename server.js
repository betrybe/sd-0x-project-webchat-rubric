require('dotenv/config');
const cors = require('cors');
const path = require('path');
const express = require('express');
const socketIo = require('socket.io');

const http = require('http');

const getMessageController = require('./controllers/messageController');
const getUserController = require('./controllers/userController');
const getModels = require('./models/index');
const connection = require('./models/connection');

const app = express();
app.use(cors());

const httpServer = http.createServer(app);
const io = socketIo(httpServer,
  {
    cors: {
      origin: 'http://localhost:3000/',
      methods: ['POST', 'GET'],
    },
  });
const PORT = 3000;

const initSocket = (socket, models) => {
  const userController = getUserController(io, socket, models.userModel);
  const onlineUsers = models.userModel.getAllOnlineUsers();
  const messageController = getMessageController(io, models.messageModel, socket, onlineUsers);

  socket.on('get-pub-history', messageController.getHistory);
  socket.on('get-pv-history', messageController.getPrivate);
  socket.on('userChangeName', userController.updateName);
  socket.on('userConn', userController.saveUser);
  socket.on('usersOnline', models.userModel.getAllOnlineUsers);
  socket.on('private', messageController.insertPrivate);
  socket.on('message', messageController.sendMessage);
  socket.on('disconnect', userController.removeUser);
};

async function start() {
  const db = await connection();
  const models = getModels(db);

  io.on('connection', (socket) => {
    initSocket(socket, models);
  });

  app.set('views', path.join(__dirname, './views'));

  app.set('view engine', 'ejs');

  app.get('/', async (_req, res) => {
    const usersOnline = models.userModel.getAllOnlineUsers();
    console.log(usersOnline);
    const getAll = await models.messageModel.getGeneral();
    const messages = await getAll.map(
      ({ nickname, date, chatMessage }) => `${nickname} ${date} ${chatMessage}`,
    );
    console.log('oi?', messages);
    res.render('index', { usersOnline, messages });
  });

  httpServer.listen(PORT, () => console.log('HTTP listening on 3000'));
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
