jest.mock('../src/models/order.model', () => ({
  find: jest.fn()
}));
const orderModel = require('../src/models/order.model');

const request = require('supertest');
const app = require('../src/app');
const { getAuthCookie } = require('./setup/auth');

describe('GET /api/orders/me', () => {

  it('returns logged-in user orders', async () => {
    orderModel.find.mockReturnValue({
      sort: jest.fn().mockResolvedValue([
        {
          _id: 'order1',
          user: 'user123',
          status: 'PENDING',
          items: [],
          totalprice: { amount: 1000, currency: 'INR' }
        },
        {
          _id: 'order2',
          user: 'user123',
          status: 'DELIVERED',
          items: [],
          totalprice: { amount: 500, currency: 'INR' }
        }
      ])
    });

    const res = await request(app)
      .get('/api/orders/me')
      .set('Cookie', getAuthCookie())
      .expect(200);

    expect(Array.isArray(res.body.orders)).toBe(true);
    expect(res.body.orders.length).toBe(2);
  });

  it('returns empty array if user has no orders', async () => {
    orderModel.find.mockReturnValue({
      sort: jest.fn().mockResolvedValue([])
    });

    const res = await request(app)
      .get('/api/orders/me')
      .set('Cookie', getAuthCookie())
      .expect(200);

    expect(res.body.orders).toEqual([]);
  });
});
