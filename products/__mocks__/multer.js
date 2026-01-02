const multer = () => {
  return {
    array: () => (req, res, next) => {
      req.files = []; // simulate no uploaded files
      next();
    },
  };
};

multer.memoryStorage = jest.fn();
module.exports = multer;
