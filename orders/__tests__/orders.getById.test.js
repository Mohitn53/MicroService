jest.mock('../src/models/order.model', () => ({
  findById: jest.fn()
}));

const orderModel = require('../src/models/order.model');
const request = require('supertest');
const app = require('../src/app');
const { getAuthCookie } = require('./setup/auth');

describe('GET /api/orders/:id', () => {

  it('returns order if it belongs to logged-in user', async () => {
    const auth = getAuthCookie();

    orderModel.findById.mockResolvedValue({
      _id: 'order123',
      user: auth.userId,
      status: 'PENDING',
      items: [],
      totalprice: { amount: 1000, currency: 'INR' }
    });

    const res = await request(app)
      .get('/api/orders/order123')
      .set('Cookie', auth) // ✅ FIX
      .expect(200);

    expect(res.body.order._id).toBe('order123');
    expect(res.body.order.status).toBe('PENDING');
  });

  it('returns 403 if order belongs to another user', async () => {
    const auth = getAuthCookie();

    orderModel.findById.mockResolvedValue({
      _id: 'order123',
      user: 'otherUserId',
      status: 'PENDING'
    });

    await request(app)
      .get('/api/orders/order123')
      .set('Cookie', auth) // ✅ FIX
      .expect(403);
  });

  it('returns 404 if order does not exist', async () => {
    const auth = getAuthCookie();

    orderModel.findById.mockResolvedValue(null);

    await request(app)
      .get('/api/orders/unknown')
      .set('Cookie', auth) // ✅ FIX
      .expect(404);
  });
});
