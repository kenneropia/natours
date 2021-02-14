//Loading Modules

const mongoose = require('mongoose')
process.on('uncaughtException', (err) => {
  console.log('UNHANDLER EXCEPTION! Shutting down...')
  console.error(err.name, ':', err.message, err.stack)

  process.exit(1)
})

require('dotenv').config()

let isProd = process.argv[2]

if (isProd) {
  process.env.NODE_ENV = 'production'
}

const DB =
  process.env.NODE_ENV === 'production'
    ? process.env.MONGODB_URL
    : process.env.MONGODB_LOCAL

console.log(DB)

const app = require('./app')

// LOADING CONFIGURATION

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then((con) => {
    console.log('DB connection successful')
  })

// Loading Express Aplication

const port = process.env.PORT || 4000

const server = app.listen(port, () => {
  console.log(`server at on ${port}`)
})

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLER REJECTION! Shutting down...')
  console.error(err.name, ':', err.message, err.start, err.end)

  server.close(() => {
    process.exit(1)
  })
})
