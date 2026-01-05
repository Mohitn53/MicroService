jest.mock('../src/models/order.model', () => ({
  find: jest.fn()
}));

const orderModel = require('../src/models/order.model');
const request = require('supertest');
const app = require('../src/app');
const jwt = require('jsonwebtoken');

const getSellerCookie = () => {
  const token = jwt.sign(
    { id: 'seller123', role: 'seller' },
    process.env.JWT_SECRET || 'testsecret'
  );
  return [`token=${token}`];
};

describe('GET /api/orders/seller', () => {

  it('returns orders containing seller products only', async () => {
    orderModel.find.mockResolvedValue([
      {
        _id: 'order1',
        status: 'PENDING',
        items: [
          {
            product: 'p1',
            seller: 'seller123',
            quantity: 2,
            price: { amount: 500, currency: 'INR' }
          },
          {
            product: 'p2',
            seller: 'otherSeller',
            quantity: 1,
            price: { amount: 1000, currency: 'INR' }
          }
        ]
      }
    ]);

    const res = await request(app)
      .get('/api/orders/seller')
      .set('Cookie', getSellerCookie())
      .expect(200);

    expect(res.body.orders.length).toBe(1);
    expect(res.body.orders[0].items.length).toBe(1);
    expect(res.body.orders[0].items[0].seller).toBe('seller123');
  });

  it('returns empty array if seller has no orders', async () => {
    orderModel.find.mockResolvedValue([]);

    const res = await request(app)
      .get('/api/orders/seller')
      .set('Cookie', getSellerCookie())
      .expect(200);

    expect(res.body.orders).toEqual([]);
  });

  it('returns 403 for non-seller user', async () => {
    const token = jwt.sign(
      { id: 'user123', role: 'user' },
      process.env.JWT_SECRET || 'testsecret'
    );

    await request(app)
      .get('/api/orders/seller')
      .set('Cookie', [`token=${token}`])
      .expect(403);
  });
});
