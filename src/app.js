require('dotenv').config()
const express = require('express')
const app = express()

const authRoutes = require('./routes/auth.routes')
const expenseRoutes = require('./routes/expense.routes')
const { errorHandler } = require('./middleware/error.middleware')

app.use(express.json())

app.use('/api/auth', authRoutes)
// app.use('/api/expenses', expenseRoutes)

app.use(errorHandler)

module.exports = app

