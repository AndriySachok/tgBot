import { Telegraf, session, Markup } from 'telegraf'
import  config  from 'config'
import { message } from 'telegraf/filters'
import { ogg, __dirname } from './ogg.js'
import { openai } from './openai.js'
import { code } from 'telegraf/format'
import { removeFile } from './utils.js'
import fs from 'fs'
import express from 'express'
import cors from 'cors'
import https from 'https'


const app = express()

const options = {
    key: fs.readFileSync(`${__dirname}/../config/https/key.pem`),
    cert: fs.readFileSync(`${__dirname}/../config/https/cert.pem`)
}
const passphrase = 'boogy'
options.passphrase = passphrase

const PORT = 443;
const server = https.createServer(options, app);

const webAppUrl = 'https://tgbotmini-app.web.app/'
let webTemplate = ''

app.use(express.json())
app.use(cors())

const bot = new Telegraf(config.get('TELEGRAM_TOKEN'))
const INITIAL_SESSION = {
    messages: [],
}

bot.command('start', async (ctx) => {
    ctx.session = {};
    ctx.session = INITIAL_SESSION
    await ctx.reply(
        'Waiting for the first message',
        Markup.keyboard([Markup.button.webApp('Preview', webAppUrl)])
    )
})

bot.command('clean', async (ctx) => {
    ctx.session = {};
    fs.createWriteStream(`${__dirname}/history.txt`, '')
    ctx.reply(code('Session has been cleaned successfuly'))
})


//voice part

bot.on(message('voice'), async (ctx) => {
    try{
        await ctx.reply(code('Processing...'))
        const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id)
        const userId = String(ctx.message.from.id)
        const oggPath = await ogg.create(link.href, userId)
        const mp3Path = await ogg.toMP3(oggPath, ctx.message.voice.file_id)
        const text = await openai.transcription(mp3Path)
        removeFile(mp3Path)

        await ctx.reply(code(`Your request: ${text}`))
        const prevMessage = fs.readFileSync(`${__dirname}/history.txt`, 'utf-8')
        const messages = [{role: 'user', content: `${prevMessage}. ${text} Write me only plain code without explanation.`}]
        await ctx.reply(code('Processing...'))
        const response = await openai.chat(messages)
        await ctx.reply(response.content)

        const correctedString = response.content.replace(/\n/g, ' ')
        webTemplate = correctedString

    } catch (e){
        console.log('Error while voice message', e.message)
    }
})


//text part
bot.use(session())

bot.on(message('text'), async (ctx) => {
    ctx.session ??= INITIAL_SESSION
    try{
        ctx.session.messages.push({role: 'user', content: ctx.message.text})
        await ctx.reply(code('Processing...'))
        const response = await openai.chat(ctx.session.messages)
        ctx.session.messages.push({role: 'assistant', content: response.content})

        await ctx.reply(response.content)
        const correctedString = response.content.replace(/\n/g, ' ')
        webTemplate = correctedString
       
    } catch (e){
        console.log('Error while text message', e.message)
    }
})

bot.launch()


app.get('/api/page', (req, res) => {
    res.json(webTemplate)
})

server.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`)
})

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))