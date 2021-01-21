const connection = require('./db');

// Insere uma mensagem no banco de dados
/*
    const datas = new Date().toISOString()
      .replace('T', ' ')
      .replace('Z', '');
*/
const add = async (nickname, formatedMessage, timestamp) => {
  const message = await connection().then((db) => db.collection('messages').insertOne({ nickname, chatMessage: formatedMessage, timestamp }));
  return message.ops[0];
};

// lista todas as mensagens
const getAll = async () => {
  const previousMessages = await connection().then((db) => db.collection('messages').find().toArray());
  return previousMessages;
};

module.exports = {
  add,
  getAll,
};
