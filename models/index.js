const connection = require('./connection');
const messageModel = require('./messageModel');
const userModel = require('./userModel');

module.exports = (db) => ({
  connection,
  messageModel: messageModel(db),
  userModel,
});
