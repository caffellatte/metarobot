const { Composer, log } = require('micro-bot')
const RethinkSession = require('./lib/RethinkSession')

const helpText = `/help - List of commands\n/start - Create user's profile\n/login - Log in to your dashboad\n/about - Feedback and complaints`
const startText = `The MetaRobot is a flexible medium for storing hyperlinks.`
const aboutText = `MetaRobot, MIT license\nCopyright (c) 2018\nAuthor: @caffellatte`

const bot = new Composer()

const opts = {
  db: 'metarobot',
  ttl: 0,
  table: '_telegraf_sessions',
  store: {
    host: process.env.RETHINKDB_HOST,
    port: process.env.RETHINK_PORT
  }
}

bot.use(log())

const session = new RethinkSession(opts)
bot.use(session.middleware())

bot.start(({ reply }) => reply(startText))
bot.help(({ reply }) => reply(helpText))
bot.command('login', ({ reply }) => reply(`login`))
bot.command('about', ({ reply }) => reply(aboutText))

bot.command('date', ({ reply }) => reply(`Server time: ${Date()}`))

bot.on('text', (ctx) => {
  ctx.session.counter = ctx.session.counter || 0
  ctx.session.counter++
  ctx.session.history = ctx.session.history || []
  ctx.session.history.push({id: ctx.session.counter, date: ctx.message.date, text: ctx.message.text})
  ctx.reply(`Session: ${ctx.session.counter}`)
})

module.exports = bot
