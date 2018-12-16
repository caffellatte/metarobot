const { Composer, log } = require('micro-bot')
const RethinkSession = require('./lib/RethinkSession')

const helpText = `/help - List of commands\n/start - Create user's profile\n/login - Log in to your dashboad\n/about - Feedback and complaints`
const startText = `The MetaRobot is a flexible medium for storing hyperlinks.`
const aboutText = `MetaRobot, MIT license\nCopyright (c) 2018\nAuthor: @caffellatte`

const bot = new Composer()

const opts = {
  store: {
    host: process.env.RETHINKDB_HOST,
    port: process.env.RETHINK_PORT
  }
}

bot.use(log())
bot.use(RethinkSession(opts))

bot.on('text', (ctx) => {
  ctx.session.counter = ctx.session.counter || 0
  ctx.session.counter++
  return ctx.reply(`Message counter:${ctx.session.counter}`)
})

bot.start(({ reply }) => reply(startText))
bot.help(({ reply }) => reply(helpText))
bot.command('login', ({ reply }) => reply(`login`))
bot.command('about', ({ reply }) => reply(aboutText))

bot.command('date', ({ reply }) => reply(`Server time: ${Date()}`))

module.exports = bot
