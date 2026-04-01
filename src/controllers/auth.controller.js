const asyncHandler = require('../utils/asyncHandler')
const { success } = require('../utils/response')
const authService = require('../services/auth.service')

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body

  if (!name || !email || !password) {
    const error = new Error('name, email and password are required')
    error.statusCode = 400
    throw error
  }

  const data = await authService.register({ name, email, password })
  success(res, data, 201)
})

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    const error = new Error('email and password are required')
    error.statusCode = 400
    throw error
  }

  const data = await authService.login({ email, password })
  success(res, data)
})

module.exports = { register, login }


