const pool = require('../config/db')

const getCategories = async () => {
  const result = await pool.query(
    'SELECT id, name FROM categories ORDER BY name ASC'
  )

  return result.rows
}


module.exports = { getCategories }

