require('dotenv').config()
const express = require('express')
const app = express()

const authRoutes = require('./routes/auth.routes')
const expenseRoutes = require('./routes/expense.routes')
const categoryRoutes = require('./routes/category.routes')
const { errorHandler } = require('./middleware/error.middleware')

app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/expenses', expenseRoutes)

app.get('/test-error', (req, res, next) => {
  const error = new Error('Something exploded internally')
  error.statusCode = 500
  next(error)
})

app.use(errorHandler)

module.exports = app

