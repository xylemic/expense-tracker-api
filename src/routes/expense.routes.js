const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/auth.middleware')
const { validateExpense } = require('../middleware/validate.middleware')
const {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getSummary
} = require('../controllers/expense.controller')

// ALL expense routes are protected
router.use(protect)

router.get('/summary', getSummary)
router.post('/', validateExpense, createExpense)
router.get('/', getExpenses)
router.get('/:id', getExpenseById)
router.put('/:id', validateExpense, updateExpense)
router.delete('/:id', deleteExpense)

module.exports = router


