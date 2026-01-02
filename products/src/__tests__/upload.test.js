const request = require('supertest')
const app = require('../../app')

describe('POST /products upload integration', () => {
  test('uploads image and returns product data', async () => {
    const res = await request(app)
      .post('/products')
      .send({ title: 'Test Product', amount: 100, currency: 'USD', seller: '507f1f77bcf86cd799439011' })
      .set('Accept', 'application/json')
      .expect(201)

    expect(res.body).toHaveProperty('ok', true)
    expect(res.body.product).toBeDefined()
    expect(res.body.product.price.images[0].url).toContain('imagekit')
  })
})
