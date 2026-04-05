const validateExpense = (req, res, next) => {
  const { amount, category_id, date, description } = req.body

  // amount
  if (amount !== undefined) {
    const parsed = parseFloat(amount)
    if (isNaN(parsed) || parsed <= 0) {
      const error = new Error('amount must be a positive number')
      error.statusCode = 400
      return next(error)
    }
  }

  // category_id
  if (category_id !== undefined) {
    const parsed = parseInt(category_id)
    if (isNaN(parsed) || parsed <= 0) {
      const error = new Error('category_id must be a valid integer')
      error.statusCode = 400
      return next(error)
    }
  }


  // date
  if (date !== undefined) {
    const parsed = new Date(date)
    if (isNaN(parsed.getTime())) {
      const error = new Error('date must be a valid date (YYYY-MM-DD)')
      error.statusCode = 400
      return next(error)
    }
  }


  // description
  if (description !== undefined && typeof description !== 'string') {
    const error = new Error('description must be a string')
    error.statusCode = 400
    return next(error)
  }


  next()
}


module.exports = { validateExpense }

