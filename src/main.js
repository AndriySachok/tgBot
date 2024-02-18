import { Telegraf, session, Markup } from 'telegraf'
import  config  from 'config'
import { message } from 'telegraf/filters'
import { ogg, __dirname } from './ogg.js'
import { openai } from './openai.js'
import { code } from 'telegraf/format'
import { removeFile, getUserData } from './utils.js'
import express from 'express'
import cors from 'cors'
import client from './redisClient.js'
import { createHashValue } from './crypto.js'


const app = express()
app.use(cors())
const PORT = 3000;

let webTemplate = ''


const bot = new Telegraf(config.get('TELEGRAM_TOKEN'))
bot.use(async (ctx, next) => {
    const userId = String(ctx.from.id)
    ctx.userHashedId =  await createHashValue(userId)
    next()
})
const INITIAL_SESSION = {
    messages: [],
}


//commands

bot.command('start', async (ctx) => {
    ctx.session = {};
    ctx.session = INITIAL_SESSION
    await ctx.reply(
        'Waiting for the first message'
    )
})

bot.command('clean', async (ctx) => {
    ctx.session = {};
    await client.del(ctx.userHashedId)
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

        const prevMessage = await getUserData(ctx.userHashedId)
        const messages = [{role: 'user', content: `${prevMessage}. ${text} Write me only plain code without explanation.`}]
        await ctx.reply(code('Processing...'))
        const response = await openai.chat(messages)
        await ctx.reply(response.content)
        await ctx.reply(`http://ec2-13-53-40-12.eu-north-1.compute.amazonaws.com/user/${ctx.userHashedId}`)

        webTemplate = response.content.replace(/\n/g, ' ')

        await client.set(ctx.userHashedId, webTemplate)
        await client.expire(ctx.userHashedId, 3600)

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
        webTemplate = response.content.replace(/\n/g, ' ')
        await client.set(ctx.userHashedId, webTemplate)
        await client.expire(ctx.userHashedId, 3600)
       
    } catch (e){
        console.log('Error while text message', e.message)
    }
})

bot.launch()

app.get('/api/page/:userId', async (req, res) => {
    try {
        const data = await getUserData(req.params.userId)
        res.json(data)
    } catch (error) {
        console.error('Error:', error)
        res.status(500).json({ error: 'Internal Server Error' })
    }
})



app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`)
})

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))