const r = require('rethinkdb')

module.exports = function (opts) {
  opts = Object.assign({
    property: 'session',
    table: '_telegraf_sessions',
    db: 'test',
    ttl: 0,
    getSessionKey: (ctx) => ctx.from && ctx.chat && `${ctx.from.id}:${ctx.chat.id}`
  }, opts)

  console.log('opts:', opts)

  r.connect(opts.store).then((conn) => {
    console.log('conn:', conn)
  }).catch((err) => {
    console.log('err', err)
  })

  const ttlMs = opts.ttl && opts.ttl * 1000
  const store = new Map()

  return (ctx, next) => {
    const key = opts.getSessionKey(ctx)
    if (!key) {
      return next(ctx)
    }
    const now = new Date().getTime()
    let { session, expires } = store.get(key) || { session: {} }
    if (expires && expires < now) {
      session = {}
    }
    Object.defineProperty(ctx, opts.property, {
      get: function () { return session },
      set: function (newValue) { session = Object.assign({}, newValue) }
    })
    return next(ctx).then(() => store.set(key, {
      session,
      expires: ttlMs ? now + ttlMs : null
    }))
  }
}
