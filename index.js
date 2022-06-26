const TelegramBot = require('node-telegram-bot-api'); // подключаем node-telegram-bot-api
const token = '1318772921:AAHpPSrBsrfZPgCxHzgVcBOpRl3gFT3GKeU'; // тут токен кторый мы получили от botFather
const {gameOptions, againOptions} = require (`./option.js`)
// включаем самого обота
const bot = new TelegramBot(token, {
    polling: true
});

const chats = {}

const startGame = async (chatId) => {
    await bot.sendMessage(chatId, `Сейчас я загадаю цифру от 0 до 9 и ты должен ее угадать`)
    const randomNumber = Math.floor(Math.random() * 10);
    chats[chatId] = randomNumber;
    await bot.sendMessage(chatId, `Угадай число`, gameOptions)
}

const start = () => {
    bot.setMyCommands([{
            command: `/start`,
            description: `Начальное приветствие`
        },
        {
            command: `/info`,
            description: `получить информацию о пользователе`
        },
        {
            command: `/game`,
            description: `Сыграть в игру`
        }
    ])

    bot.on(`message`, async msg => {
        const text = msg.text;
        const chatId = msg.chat.id;
        if (text === `/start`) {
            return bot.sendSticker(chatId, `https://tlgrm.ru/_/stickers/1b5/0ab/1b50abf8-8451-40ca-be37-ffd7aa74ec4d/1.webp`)
            return bot.sendMessage(chatId, `Добро пожаловать в телеграм бот`)
        }
        if (text === `/info`) {
            return bot.sendMessage(chatId, `Тебя зовут ${msg.from.first_name} ${msg.from.last_name}`);
        }
        if (text === `/game`) {
            return startGame(chatId);
        }
        return bot.sendMessage(chatId, `Я тебя не понимаю`)
    })

    bot.on(`callback_query`, async msg => {
        const data = msg.data;
        const chatId = msg.message.chat.id;
        if (data === `/again`) {
            return startGame(chatId);
        }
        if (data === chats[chatId]) {
            return await bot.sendMessage(chatId, `Ты отгадал цифру ${chats[chatId]}`, againOptions)
        } else {
            return await bot.sendMessage(chatId, `К сожалению ты не угадал, т к бот загадал цифру ${chats[chatId]}`, againOptions)
        }
    })
}

start()
