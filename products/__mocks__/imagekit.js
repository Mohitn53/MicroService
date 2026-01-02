// Minimal ImageKit mock
module.exports = {
  upload: jest.fn((fileBuffer, options, callback) => {
    // simulate async upload result
    const result = { fileId: 'mock-file-id', url: 'https://imagekit.io/mock/test.jpg' }
    if (callback && typeof callback === 'function') return callback(null, result)
    return Promise.resolve(result)
  }),
  config: jest.fn()
}
