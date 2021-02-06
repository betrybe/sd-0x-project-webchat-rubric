const arrRegistredUsers = [];

const addNewUserInMemory = (socketUser) => {
  arrRegistredUsers.push(socketUser);
};

const removeUserInMemory = (socketUser) => {
  arrRegistredUsers.splice(arrRegistredUsers.indexOf(socketUser.nickname), 1);
};

const getUsersInMemory = () => arrRegistredUsers;

module.exports = {
  addNewUserInMemory,
  getUsersInMemory,
  removeUserInMemory,
};
