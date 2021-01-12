let onlineUsers = [];

const saveUser = (nickname, socketId) =>
  onlineUsers.push({ nickname, socketId });

const getAllOnlineUsers = () => onlineUsers;

const removeUser = (id) => {
  const user = onlineUsers.find(({ socketId }) => socketId === id);
  onlineUsers = onlineUsers.filter(({ socketId }) => socketId !== id);

  return user;
};

const updateUser = (user, newName) => {
  onlineUsers = onlineUsers.map(({ nickname, socketId }) =>
    (nickname === user ? { nickname: newName, socketId } : { nickname, socketId }));
};

module.exports = {
  saveUser,
  getAllOnlineUsers,
  removeUser,
  updateUser,
  onlineUsers,
};
