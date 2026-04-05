const pool = require('../config/db')

const createExpense = async (userId, { amount, category_id, description, date }) => {
  // verify if category exists
  const category = await pool.query(
    `SELECT id FROM categories WHERE id = $1`,
    [category_id]
  )

  if (category.rows.length === 0) {
    const error = new Error('invalid category')
    error.statusCode = 400
    throw error
  }

  const result = await pool.query(
    `INSERT INTO expenses (user_id, category_id, amount, description, date)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *
    `,
    [userId, category_id, amount, description || null, date]
  )


  return result.rows[0]
}


// GET ALL (with filtering + pagination)
const getExpenses = async (userId, query) => {
  const { category_id, from, to, page = 1, limit = 10 } = query

  const offset = (page - 1) * limit

  // build the WHERE clause dynamically
  // why: filters are optional - should not be hardcoded
  const conditions = [`e.user_id = $1`]
  const values = [userId]
  let i = 2 // next param index

  if (category_id) {
    conditions.push(`e.category_id = $${i++}`)
    values.push(category_id)
  }

  if (from) {
    conditions.push(`e.date >= $${i++}`)
    values.push(from)
  }

  
  if (to) {
    conditions.push(`e.date <= $${i++}`)
    values.push(to)
  }


  const where = conditions.join(' AND ')

  // get total count for pagination metadata
  const countResult = await pool.query(
    `SELECT COUNT(*) FROM expenses e WHERE ${where}`,
    values
  )
  const total = parseInt(countResult.rows[0].count)

  // get paginated expenses, JOIN categories to get name
  const result = await pool.query(
    `SELECT
      e.id,
      e.amount,
      e.description,
      e.date,
      e.created_at,
      c.id    AS category_id,
      c.name  AS category_name
    FROM expenses e
    JOIN categories c ON e.category_id = c.id
    WHERE ${where}
    ORDER BY e.date DESC
    LIMIT $${i++} OFFSET $${i++}
    `,
    [...values, limit, offset]
  )

  return {
    expenses : result.rows,
    pagination : {
      total,
      page : parseInt(page),
      limit : parseInt(limit),
      pages : Math.ceil(total / limit)
    },
  }
}


// GET ONE
const getExpenseById = async (userId, expenseId) => {
  const result = await pool.query(
    `SELECT
       e.id,
       e.amount,
       e.description,
       e.date,
       e.created_at,
       c.id   AS category_id,
       c.name AS category_name
    FROM expenses e
    JOIN categories c ON e.category_id = c.id
    WHERE e.id = $1 AND e.user_id = $2
    `,
    [expenseId, userId]
  )

  if (result.rows.length === 0) {
    const error = new Error('expense not found')
    error.statusCode = 404
    throw error
  }

  return result.rows[0]
}


// UPDATE
const updateExpense = async (userId, expenseId, fields) => {
  // first confirm this expense belongs to this user
  const existing = await pool.query(
    `SELECT id FROM expenses WHERE id = $1 AND user_id = $2`,
    [expenseId, userId]
  )

  if (existing.rows.length === 0) {
    const error = new Error('expense not found')
    error.statusCode = 404
    throw error
  }


  const { amount, category_id, description, date } = fields

  const result = await pool.query(
    `UPDATE expenses
     SET
       amount        = COALESCE($1, amount),
       category_id   = COALESCE($2, category_id),
       description   = COALESCE($3, description),
       date          = COALESCE($4, date)
    WHERE id = $5 AND user_id = $6
    RETURNING *
    `,
    [amount, category_id, description, date, expenseId, userId]
  )

  return result.rows[0]
}


// DELETE
const deleteExpense = async (userId, expenseId) => {
  const result = await pool.query(
    `DELETE FROM expenses
    WHERE id = $1 AND user_id = $2
    RETURNING id
    `,
    [expenseId, userId]
  )

  if (result.rows.length === 0) {
    const error = new Error('expense not found')
    error.statusCode = 404
    throw error
  }

  return { message : 'expense delete' }
}


const getSummary = async (userId, query) => {
  const { from, to } = query
  const conditions = ['e.user_id = $1']
  const values = [userId]
  let i = 2

  if (from) {
    conditions.push(`e.date >= $${ i++}`)
    values.push(from)
  }

  if (to) {
    conditions.push(`e.date <= $${i++}`)
    values.push(to)
  }


  const where = conditions.join(' AND ')

  // total overall
  const totalResult = await pool.query(
    `SELECT COALESCE(SUM(amount), 0) AS total
     FROM expenses e
     WHERE ${where}
    `,
    values
  )


  // per category
  const byCategoryResult = await pool.query(
    `SELECT
       c.name          AS category,
       COALESCE(SUM(e.amount), 0) AS total
    FROM expenses e
    JOIN categories c ON e.category_id = c.id
    WHERE ${where}
    GROUP BY c.name
    ORDER BY total DESC
    `,
    values
  )


  // monthly breakdown
  const byMonthResult = await pool.query(
    `SELECT
        TO_CHAR(e.date, 'YYYY-MM')  AS month,
        COALESCE(SUM(e.amount), 0)  AS total
    FROM expenses e
    WHERE ${where}
    GROUP BY month
    ORDER BY month DESC
    `,
    values
  )

  return {
    total : parseFloat(totalResult.rows[0].total),
    by_category : byCategoryResult.rows.map(row => ({
      category : row.category,
      total : parseFloat(row.total),
    })),
    by_month : byMonthResult.rows.map(row => ({
      month : row.month,
      total : parseFloat(row.total)
    }))
  }
}


module.exports = {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getSummary
}

