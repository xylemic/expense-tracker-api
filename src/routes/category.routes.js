const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/auth.middleware')
const { getCategories } = require('../controllers/category.controller')


router.use(protect)

router.get('/', getCategories)

module.exports = router


