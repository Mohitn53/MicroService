jest.mock('../src/models/order.model', () => ({
  findById: jest.fn()
}));

const orderModel = require('../src/models/order.model');
const request = require('supertest');
const app = require('../src/app');
const { getAuthCookie } = require('./setup/auth');

describe('PATCH /api/orders/:id/cancel', () => {

  it('cancels order if it belongs to user and is cancellable', async () => {
    const auth = getAuthCookie();

    orderModel.findById.mockResolvedValue({
      _id: 'order123',
      user: auth.userId,
      status: 'PENDING',
      save: jest.fn()
    });

    const res = await request(app)
      .patch('/api/orders/order123/cancel')
      .set('Cookie', auth)
      .expect(200);

    expect(res.body.order.status).toBe('CANCELLED');
  });

  it('returns 403 if user does not own the order', async () => {
    const auth = getAuthCookie();

    orderModel.findById.mockResolvedValue({
      _id: 'order123',
      user: 'otherUser',
      status: 'PENDING'
    });

    await request(app)
      .patch('/api/orders/order123/cancel')
      .set('Cookie', auth)
      .expect(403);
  });

  it('returns 400 if order is already shipped', async () => {
    const auth = getAuthCookie();

    orderModel.findById.mockResolvedValue({
      _id: 'order123',
      user: auth.userId,
      status: 'SHIPPED'
    });

    await request(app)
      .patch('/api/orders/order123/cancel')
      .set('Cookie', auth)
      .expect(400);
  });

  it('returns 404 if order does not exist', async () => {
    const auth = getAuthCookie();

    orderModel.findById.mockResolvedValue(null);

    await request(app)
      .patch('/api/orders/unknown/cancel')
      .set('Cookie', auth)
      .expect(404);
  });
});
