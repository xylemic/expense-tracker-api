require('dotenv').config()
const pool = require('./config/db')

const test = async () => {
  try {
    const result = await pool.query('SELECT NOW()')
    console.log(result.rows)
  } catch (err) {
    console.error(err)
  }
}


test()


