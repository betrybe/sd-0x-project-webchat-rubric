/**
 * @jest-environment node
 */
const cheerio = require('cheerio');
const axios = require('axios');
require('dotenv').config();
const io = require('socket.io-client');
const faker = require('faker');
const puppeteer = require('puppeteer');
const { MongoClient } = require('mongodb');

const BASE_URL = 'http://localhost:3000/';

function generateMessage() {
  const chatMessage = faker.hacker.phrase();
  const nickname = faker.name.firstName();
  return { chatMessage, nickname };
}

function wait(time) {
  const start = Date.now();
  while (true) {
    if (Date.now() - start >= time) {
      return true;
    }
  }
}

describe('Elabore o histórico do chat para que as mensagens persistão', () => {
  const client1 = io(BASE_URL);
  const client2 = io(BASE_URL);
  let browser;
  let page;
  let connection;
  let db;

  beforeAll(async () => {
    connection = await MongoClient.connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    db = connection.db(process.env.DB_NAME);
    browser = await puppeteer.launch({ args: ['--no-sandbox', '--window-size=1920,1080'], headless: true });
  });

  beforeEach(async () => {
    await db.collection('messages').deleteMany({});
    page = await browser.newPage();
  });

  afterEach(() => {
    page.close();
    client1.disconnect();
    client2.disconnect();
  });

  afterAll(async () => {
    await db.collection('messages').deleteMany({});
    await connection.close();
    browser.close();
  });

  it('Será validado que todo o histórico de mensagens irá aparecer quando o cliente se conectar', async () => {
    const firstMessageToSend = generateMessage();
    const secondMessageToSend = generateMessage();
    client1.emit('message', firstMessageToSend);
    client2.emit('message', secondMessageToSend);

    await page.goto(BASE_URL);
    await page.waitForSelector('[data-testid=message]');
    const messages = await page.$$eval('[data-testid=message]', (nodes) => nodes.map((n) => n.innerText));
    expect(messages.length).toBeGreaterThanOrEqual(2);

    const lastMessage = messages.pop();
    expect(lastMessage).toMatch(RegExp(secondMessageToSend.chatMessage));
    const secondLastMessage = messages.pop();
    expect(secondLastMessage).toMatch(RegExp(firstMessageToSend.chatMessage));
  });

  it('Será validado que ao enviar uma mensagem e recarregar a página , a mensagem persistirá', async () => {
    const chatMessage = faker.hacker.phrase();
    const nickname = 'Tiago Abravanel';

    await page.goto(BASE_URL);

    const nicknameBox = await page.$('[data-testid=nickname-box]');
    await nicknameBox.type(nickname);
    const saveButton = await page.$('[data-testid=nickname-save]');
    await saveButton.click();

    const messageBox = await page.$('[data-testid=message-box]');
    await messageBox.type(chatMessage);
    const sendButton = await page.$('[data-testid=send-button]');
    await sendButton.click();

    await page.reload();
    await page.waitForSelector('[data-testid=message]');
    const messages = await page.$$eval('[data-testid=message]', (nodes) => nodes.map((n) => n.innerText));
    expect(messages[0]).toMatch(RegExp(chatMessage));
  });

  it('Será validado histórico de mensagens em MVC', async () => {
    const chatMessage = faker.hacker.phrase();
    const nickname = 'Jorge da Capadócia';

    await page.goto(BASE_URL);

    const nicknameBox = await page.$('[data-testid=nickname-box]');
    await nicknameBox.type(nickname);
    const saveButton = await page.$('[data-testid=nickname-save]');
    await saveButton.click();

    const messageBox = await page.$('[data-testid=message-box]');
    await messageBox.type(chatMessage);
    const sendButton = await page.$('[data-testid=send-button]');
    await sendButton.click();

    const response = await axios.get('http://localhost:3000/');
    const $ = cheerio.load(response.data);
    const message = $('[data-testid="message"]').html()
    expect(message.includes(nickname)).toBeTruthy();
    expect(message.includes(chatMessage)).toBeTruthy();
  });
});
