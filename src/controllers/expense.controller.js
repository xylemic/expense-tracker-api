const asyncHandler = require('../utils/asyncHandler')
const { success } = require('../utils/response')
const expenseService = require('../services/expense.service')

const createExpense = asyncHandler(async (req, res) => {
  const { amount, category_id, description, date } = req.body

  if (!amount || !category_id || !date) {
    const error = new Error('amount, category_id and date are required')
    error.statusCode = 400
    throw error
  }

  const expense = await expenseService.createExpense(req.user.id, {
    amount,
    category_id,
    description,
    date
  })

  success(res, { expense }, 201)
})


const getExpenses = asyncHandler(async (req, res) => {
  const data = await expenseService.getExpenses(req.user.id, req.query)
  success(res, data)
})


const getExpenseById = asyncHandler(async (req, res) => {
  const expense = await expenseService.getExpenseById(
    req.user.id,
    req.params.id,
    req.body
  )
  success(res, { expense })
})

const updateExpense = asyncHandler(async (req, res) => {
  const expense = await expenseService.updateExpense(
    req.user.id,
    req.params.id,
    req.body
  )
  success(res, { expense })
})


const deleteExpense = asyncHandler(async (req, res) => {
  const result = await expenseService.deleteExpense(
    req.user.id,
    req.param.id
  )
  success(res, result)
})


const getSummary = asyncHandler(async (req, res) => {
  const data = await expenseService.getSummary(req.user.id, req.query)
  success(res, data)
})


module.exports = {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getSummary
}


