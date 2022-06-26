const TelegramBot = require('node-telegram-bot-api'); // подключаем node-telegram-bot-api
const {gameOptions, againOptions} = require (`./option.js`)
const sequelize = require(`./db`)
const UserModel = require(`./models`)

const token = '1318772921:AAHpPSrBsrfZPgCxHzgVcBOpRl3gFT3GKeU'; // тут токен кторый мы получили от botFather
// включаем самого обота
const bot = new TelegramBot(token, {polling: true});

const chats = {}

const startGame = async (chatId) => {
    await bot.sendMessage(chatId, `Сейчас я загадаю цифру от 0 до 9 и ты должен ее угадать`)
    const randomNumber = Math.floor(Math.random() * 10);
    chats[chatId] = randomNumber;
    await bot.sendMessage(chatId, `Угадай число`, gameOptions)
}

const start = async () => {

    try {
        await sequelize.authenticate()
        await sequelize.sync()
    } catch (e) {
        console.log(`подключение к бд сломалось`, e)
    }

    bot.setMyCommands([
        {command: '/start', description: 'Начальное приветствие'},
        {command: '/info', description: 'Получить информацию о пользователе'},
        {command: '/game', description: 'Игра угадай цифру'},
    ])

    bot.on(`message`, async msg => {
        const text = msg.text;
        const chatId = msg.chat.id;

        try {
            if (text === `/start`) {
                await UserModel.create({chatId})
                await bot.sendSticker(chatId, `https://tlgrm.ru/_/stickers/1b5/0ab/1b50abf8-8451-40ca-be37-ffd7aa74ec4d/1.webp`)
                await bot.sendMessage(chatId, `Добро пожаловать в телеграм бот`)
            } else if (text === `/info`) {
                const user = await UserModel.findOne({chatId})
                await bot.sendMessage(chatId, `Тебя зовут ${msg.from.first_name} ${msg.from.last_name}, в игре у тебя ${user.right} правильных ответов и ${user.wrong} неправильных`);
            } else if (text === `/game`) {
                return startGame(chatId);
            } else return bot.sendMessage(chatId, `Я тебя не понимаю`)
        } catch (e) {
            return bot.sendMessage(chatId, `Произошла какая-то ошибка`)
        }
    })

    bot.on(`callback_query`, async msg => {
        const data = msg.data;
        const chatId = msg.message.chat.id;
        if (data === `/again`) {
            return startGame(chatId);
        }
        const user = await UserModel.findOne({chatId})
        if (data == chats[chatId]) {
            user.right += 1;
            await bot.sendMessage(chatId, `Ты отгадал цифру ${chats[chatId]}`, againOptions)
        } else {
            user.wrong+=1;
            await bot.sendMessage(chatId, `К сожалению ты не угадал, т к бот загадал цифру ${chats[chatId]}`, againOptions)
        }
        await user.save();
    })
}

start()