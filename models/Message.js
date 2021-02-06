const moment = require('moment');
const conn = require('./connection');

const save = async ({ chatMessage, nickname }) => {
  try {
    const date = moment().format('DD-MM-yyyy HH:mm:ss A');
    const db = await conn();
    const result = await db.collection('messages').insertOne({ chatMessage, nickname, date });

    return result.ops[0];
  } catch (error) {
    return null;
  }
};

async function getAll() {
  try {
    const db = await conn();
    return await db.collection('messages').find({}, { _id: 0 }).toArray();
  } catch (error) {
    return null;
  }
}

module.exports = {
  save,
  getAll,
};
