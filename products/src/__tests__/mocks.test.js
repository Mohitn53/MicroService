const request = require('supertest')
const express = require('express')

// require the mocked modules directly
const multer = require('multer')
const imagekit = require('imagekit')

describe('Manual mocks for multer and imagekit', () => {
  test('multer mock attaches req.file', done => {
    const app = express()
    app.post('/upload', multer().single(), (req, res) => {
      expect(req.file).toBeDefined()
      expect(req.file.originalname).toBe('test.jpg')
      res.status(200).json({ ok: true })
    })

    request(app)
      .post('/upload')
      .send({})
      .expect(200, done)
  })

  test('imagekit mock upload returns a mock url (promise)', async () => {
    const result = await imagekit.upload(Buffer.from(''), {})
    expect(result).toHaveProperty('url')
    expect(result.url).toContain('imagekit.io')
  })

  test('imagekit mock upload with callback', done => {
    imagekit.upload(Buffer.from(''), {}, (err, res) => {
      expect(err).toBeNull()
      expect(res).toHaveProperty('fileId')
      done()
    })
  })
})
