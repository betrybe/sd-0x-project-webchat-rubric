/* const userModel = require('../models/userModel'); */

const updateName = (io, socket, userModel) =>
  (req) => {
    try {
      const { nickname, newName } = req;

      if (!newName) {
        throw new Error('Missing new name');
      }

      userModel.updateUser(nickname, newName);
      const onlineUsers = userModel.getAllOnlineUsers();
      /*       const user = onlineUsers.find(({ socketId }) => socketId === socket.id);
 */
      socket.emit('userChangeName', { newName });
      socket.broadcast.emit('someone-change-name', { nickname, newName });

      io.emit('online', onlineUsers);
    } catch (err) {
      console.error(err);
    }
  };

const saveUser = (io, socket, userModel) =>
  (req) => {
    try {
      console.log('req', req);
      const nickname = req;
      const { id } = socket;

      userModel.saveUser(nickname, id);
      const onlineUsers = userModel.getAllOnlineUsers();

      socket.emit('self-join', { nickname });
      socket.broadcast.emit('joined', { nickname });

      io.emit('online', onlineUsers);
    } catch (err) {
      console.error(err);
    }
  };

const removeUser = (io, socket, userModel) =>
  () => {
    try {
      const { id } = socket;

      const removedUser = userModel.removeUser(id);

      const nickname = removedUser ? removedUser.nickname : 'Alguém';

      const onlineUsers = userModel.getAllOnlineUsers();

      socket.broadcast.emit('left-chat', { nickname });

      io.emit('online', onlineUsers);
    } catch (err) {
      console.error(err);
    }
  };

const getUserController = (io, socket, userModel) => ({
  updateName: updateName(io, socket, userModel),
  saveUser: saveUser(io, socket, userModel),
  removeUser: removeUser(io, socket, userModel),
});

module.exports = getUserController;
