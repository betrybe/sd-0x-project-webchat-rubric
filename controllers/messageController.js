// const messageModel = require('../models/messageModel')
const getHistory = () => async (messageModel) => {
  try {
    const messages = await messageModel.getGeneral();

    const history = await messages.map(({ chatMessage }) => chatMessage);

    return history;
  } catch (err) {
    console.error(err);
  }
};

const sendMessage = (io, messageModel) => async (req) => {
  try {
    const { chatMessage, nickname } = req;

    const date = `${new Date().getUTCDate()}-${new Date().getMonth()}-${new Date().getFullYear()}`;
    const time = new Date().toLocaleTimeString('pt-BR');

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

const factory = (io, messageModel) => ({
  getHistory: getHistory(messageModel),
  sendMessage: sendMessage(io, messageModel),
});

module.exports = factory;
