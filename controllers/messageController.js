const getHistory = (socket, messageModel) => async () => {
  try {
    const messages = await messageModel.getGeneral();

    const history = await messages.map(({ chatMessage, date, nickname }) => `${date} - ${nickname}: ${chatMessage}`);

    socket.emit('history', history);
  } catch (err) {
    console.error(err);
  }
};

const date = `${new Date().getUTCDate()}-${new Date().getMonth()}-${new Date().getFullYear()}`;
const time = new Date().toLocaleTimeString('pt-BR');

const sendMessage = (io, messageModel) => async (req) => {
  try {
    const { chatMessage, nickname } = req;
    if (!chatMessage) {
      throw new Error('Missing message');
    }

    await messageModel.insertGeneral({
      nickname,
      chatMessage,
      date: `${date} ${time}`,
    });

    const message = `${date} ${time} - ${nickname}: ${chatMessage}`;

    io.emit('message', message);
  } catch (err) {
    console.error(err);
  }
};

const getPrivate = (socket, messageModel) => async (req) => {
  const data = await messageModel.getPrivate(req);
  socket.emit('history', data ? data.messages : []);
};

const insertPrivate = (io, messageModel, onlineUsers) => async ({ users, chatMessage }) => {
  const socketReceiver = onlineUsers.find((el) => el.nickname === users.receiver);
  const message = `${date} ${time} - ${users.sender}: ${chatMessage}`;

  await messageModel.insertPrivate({
    users: [users.sender, users.receiver],
    chatMessage: message,
  });

  io.to(socketReceiver.socketId).emit('dm', message);
};

const factory = (io, messageModel, socket, onlineUsers) => ({
  getHistory: getHistory(socket, messageModel),
  sendMessage: sendMessage(io, messageModel),
  getPrivate: getPrivate(socket, messageModel),
  insertPrivate: insertPrivate(io, messageModel, onlineUsers),
});

module.exports = factory;
