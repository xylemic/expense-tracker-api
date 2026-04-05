const asyncHandler = require('../utils/asyncHandler')
const { success } = require('../utils/response')
const categoryService = require('../services/category.service')


const getCategories = asyncHandler(async (req, res) => {
  const categories = await categoryService.getCategories()
  success(res, { categories })
})

module.exports = { getCategories }

