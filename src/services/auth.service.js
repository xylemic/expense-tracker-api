const pool = require('../config/db')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const register = async ({ name, email, password }) => {
  const existing = await pool.query(
    `SELECT id FROM users WHERE email = $1`,
    [email]
  )

  if (existing.rows.length > 0) {
    const error = new Error('email already in use')
    error.statusCode = 409
    throw error
  }

  const hashed = await bcrypt.hash(password, 10)

  const result = await pool.query(
    `INSERT INTO users (name, email, password)
     VALUES ($1,$2, $3)
     RETURNING id, name, created_at
    `,
    [name, email, hashed]
  )

  const user = result.rows[0]

  const token = jwt.sign(
    { id : user.id, email : user.email },
    process.env.JWT_SECRET,
    { expiresIn : '1h' }
  )

  return { user, token }
}


const login = async ({ email, password }) => {
  const result = await pool.query(
    `SELECT * FROM users WHERE email = $1`,
    [email]
  )

  if (result.rows.length === 0) {
    const error = new Error('invalid credentials')
    error.statusCode = 401
    throw error
  }

  const user = result.rows[0]

  const match = await bcrypt.compare(password, user.password)

  if (!match) {
    const error = new Error('invalid credentials')
    error.statusCode = 401
    throw error
  }


  const token = jwt.sign(
    { id : user.id, email : user.email },
    process.env.JWT_SECRET,
    { expiresIn : '1h' }
  )


  return {
    user : { id : user.id, name : user.name, email : user.email },
    token
  }
}


module.exports = {
  register,
  login
}

