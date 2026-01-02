// Minimal multer mock that emulates middleware behaviour
const multer = () => {
  return (req, res, next) => {
    // simulate file being attached
    req.file = req.file || { originalname: 'test.jpg', buffer: Buffer.from('') }
    next()
  }
}

// support .single(), .array(), etc.
multer.single = () => multer()
multer.array = () => multer()
module.exports = multer
