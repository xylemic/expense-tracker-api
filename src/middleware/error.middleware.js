const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500

  const message = 
    statusCode === 500 && process.env.NODE_ENV === 'production'
      ? 'something went wrong'
      : err.message

  // in dev, log the full stack
  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack)
  }

  res.status(statusCode).json({ success : false, message })
}


module.exports = { errorHandler }

