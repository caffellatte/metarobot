const r = require('rethinkdb')

class RethinkSession {

  constructor (options) {
    this.options = Object.assign({
      property: 'session',
      getSessionKey: (ctx) => ctx.from && ctx.chat && `${ctx.from.id}:${ctx.chat.id}`
    }, options)

    r.connect(options.store).then((conn) => {

      this.connection = conn
      console.log('connection open:', this.connection.open)

      console.log('options:', options)
      console.log('this.options:', this.options)

      this.dbCreate(this.options.db).then(() => {
        this.tableCreate(this.options.db, this.options.table)
      })

    }).catch((err) => {
      console.log('connection err', err)
    })
  }

  dbCreate (db) {
    console.log('creating db...', db)
    return new Promise((resolve, reject) => {
      r.dbCreate(db).run(this.connection, (err, result) => {
        if (err) {
          if (err.msg.includes("already exists") == true) {
            console.log(`DataBase ${db} already exists`)
            resolve()
          } else {
            console.log('error while creating db:', err)
            return reject(err)
          }
        }
        else {
          console.log('DataBase Created', result)
          resolve()
        }
      })
    })
  }

  tableCreate (db, table) {
    console.log('creating table...', table)
    return new Promise((resolve, reject) => {
      r.db(db).tableCreate(table).run(this.connection, (err, result) => {
        if (err) {
          if (err.msg.includes("already exists") == true) {
            console.log(`Table ${table} already exists`)
            resolve()
          } else {
            console.log('error while creating table:', err)
            return reject(err)
          }
        }
        else {
          console.log('tableCreate:', result)
          resolve()
        }
      })
    })
  }

  getSession (key) {
    console.log('Getting session for %s', key);
    return new Promise((resolve, reject) => {
      r.db(this.options.db).table(this.options.table).get(key).run(this.connection, (err, result) => {
        if (err) {
          console.log(`Session (${key}) not found`)
          return reject(err)
        }
        if (result) {
          try {
            const session = result
            console.log('session state', key, session)
            resolve(session)
          } catch (error) {
            console.log('Parse session state failed', error)
          }
        }
        resolve({})
      })
    })
  }

  clearSession (key) {
    console.log('clear session', key)
    return new Promise((resolve, reject) => {
      r.db(this.options.db).table(this.options.table).get(key).delete().run(this.connection, (err, result) => {
        if (err) {
          return reject(err)
        }
        console.log('clearSession', result)
        resolve()
      })
    })
  }

  saveSession (key, session) {
    if (!session || Object.keys(session).length === 0) {
      return this.clearSession(key)
    }
    console.log('save session', key, session)
    return new Promise((resolve, reject) => {
      r.db(this.options.db).table(this.options.table).insert({id: key, ...session}, {conflict: 'replace'}).run(this.connection, (err, result) => {
        if (err) {
          console.log('Error while saving session', err)
          return reject(err)
        }
        console.log('saveSession', result)
        resolve({})
      })
    })
  }

  middleware () {
    return (ctx, next) => {
      const key = this.options.getSessionKey(ctx)
      if (!key) {
        return next()
      }
      return this.getSession(key).then((session) => {
        console.log('session snapshot', key, session)
        Object.defineProperty(ctx, this.options.property, {
          get: function () { return session },
          set: function (newValue) { session = Object.assign({}, newValue) }
        })
        return next().then(() => {
          this.saveSession(key, session)
        })
      })
    }
  }
}

module.exports = RethinkSession
