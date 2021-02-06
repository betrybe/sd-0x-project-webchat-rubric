const Message = require('../models/Message');

const getAllMessages = async (_req, res) => {
  const messages = await Message.getAll();
  res.render('index', { messages });
};

const saveMessage = async (data) => {
  try {
    const messageSaved = await Message.save(data);
    return messageSaved;
  } catch (error) {
    return {};
  }
};

module.exports = {
  getAllMessages,
  saveMessage,
};
