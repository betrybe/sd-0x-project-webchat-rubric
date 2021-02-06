window.onload = () => {
  const clientSocketIo = window.io('http://localhost:3000/');

  function createBoxMessage(dateTime, owner, message) {
    const div = document.createElement('div');
    div.classList.add('notification', 'has-background-black-ter', 'has-text-grey-lighter', 'is-flex', 'is-flex-direction-column');
    div.setAttribute('data-testid', 'message');

    let small = document.createElement('small');
    small.classList.add('datetime', 'has-background-black', 'p-1');
    small.textContent = dateTime;
    div.appendChild(small);

    small = document.createElement('small');
    small.classList.add('has-text-weight-bold');
    small.textContent = `${owner}:`;
    div.appendChild(small);

    const p = document.createElement('p');
    p.textContent = message;
    div.appendChild(p);
    return div;
  }

  function createBoxUser(user, me = true) {
    const div = document.createElement('div');
    div.classList.add('tags', 'has-addons', 'is-align-self-center', 'is-flex-wrap-nowrap');

    let small = document.createElement('small');
    small.classList.add('tag', 'has-background-black', 'has-text-grey-lighter', 'onlineNickname');
    small.setAttribute('data-testid', 'online-user');
    small.textContent = user;
    div.appendChild(small);

    small = document.createElement('small');
    if (me) small.classList.add('tag', 'is-success');
    else small.classList.add('tag', 'is-info');
    div.appendChild(small);

    return div;
  }

  document.querySelector('a[data-testid="nickname-save"]')
    .addEventListener('click', () => {
      const inputNewNickname = document.querySelector('input[data-testid="nickname-box"]');

      if (inputNewNickname.value !== '') {
        document.querySelectorAll('small[data-testid="online-user"]')[0].innerHTML = inputNewNickname.value
        clientSocketIo.emit('changeNick', inputNewNickname.value);
        inputNewNickname.value = '';
      }
    });

  document.querySelector('a[data-testid="send-button"]')
    .addEventListener('click', () => {
      const inputNewMessage = document.querySelector('input[data-testid="message-box"]');
      const nickname = document.querySelectorAll('small[data-testid="online-user"]')[0].innerText;

      if (inputNewMessage.value !== '') {
        clientSocketIo.emit('message', { chatMessage: inputNewMessage.value, nickname });
        inputNewMessage.value = '';
      }
    });

  clientSocketIo.on('message', (receivedMessage) => {
    const vetInfo = receivedMessage.split(' - ');
    const dateTime = vetInfo[0];
    const vetMessage = vetInfo[1].split(':');
    const owner = vetMessage[0];
    const message = vetMessage[1];

    const boxMessage = createBoxMessage(dateTime, owner, message);
    const contentBox = document.querySelector('article');
    contentBox.appendChild(boxMessage);
  });

  clientSocketIo.on('myNickname', ({ myNickname, peopleOnline }) => {
    let boxUsers = createBoxUser(myNickname);
    const contentBoxUserOnline = document.querySelector('aside');
    contentBoxUserOnline.appendChild(boxUsers);

    peopleOnline.forEach((user) => {
      if (user.nickname !== myNickname) {
        boxUsers = createBoxUser(user.nickname, false);
        contentBoxUserOnline.appendChild(boxUsers);
      }
    });
  });

  clientSocketIo.on('newUser', (receivedNewUsernameOnline) => {
    const boxUsers = createBoxUser(receivedNewUsernameOnline, false);
    const contentBoxUserOnline = document.querySelector('aside');
    contentBoxUserOnline.appendChild(boxUsers);
  });

  clientSocketIo.on('offline', (userDisconnected) => {
    document.querySelectorAll('small[data-testid="online-user"]').forEach((user) => {
      if (user.innerText === userDisconnected) {
        user.parentNode.remove();
      }
    });
  });

  clientSocketIo.on('updateNickUser', ({ newNickname, oldNickname }) => {
    document.querySelectorAll('small[data-testid="online-user"]').forEach((user) => {
      if (user.innerText === oldNickname) {
        user.innerText = newNickname;
      }
    });
  });
}
