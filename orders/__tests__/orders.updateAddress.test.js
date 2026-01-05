jest.mock('../src/models/order.model', () => ({
  findById: jest.fn()
}));

const orderModel = require('../src/models/order.model');
const request = require('supertest');
const app = require('../src/app');
const { getAuthCookie } = require('./setup/auth');

describe('PATCH /api/orders/:id/address', () => {

  const newAddress = {
    street: '221B Baker Street',
    city: 'London',
    state: 'London',
    pincode: 'NW16XE',
    country: 'UK'
  };

  it('updates address if order belongs to user and is allowed', async () => {
    const auth = getAuthCookie();

    orderModel.findById.mockResolvedValue({
      _id: 'order123',
      user: auth.userId,
      status: 'PENDING',
      shippingAddress: {},
      save: jest.fn()
    });

    const res = await request(app)
      .patch('/api/orders/order123/address')
      .set('Cookie', auth)
      .send({ shippingAddress: newAddress })
      .expect(200);

    expect(res.body.order.shippingAddress.city).toBe('London');
  });

  it('returns 403 if user does not own the order', async () => {
    const auth = getAuthCookie();

    orderModel.findById.mockResolvedValue({
      _id: 'order123',
      user: 'otherUser',
      status: 'PENDING'
    });

    await request(app)
      .patch('/api/orders/order123/address')
      .set('Cookie', auth)
      .send({ shippingAddress: newAddress })
      .expect(403);
  });

  it('returns 400 if order is already delivered', async () => {
    const auth = getAuthCookie();

    orderModel.findById.mockResolvedValue({
      _id: 'order123',
      user: auth.userId,
      status: 'DELIVERED'
    });

    await request(app)
      .patch('/api/orders/order123/address')
      .set('Cookie', auth)
      .send({ shippingAddress: newAddress })
      .expect(400);
  });

  it('returns 400 if address is invalid', async () => {
    const auth = getAuthCookie();

    await request(app)
      .patch('/api/orders/order123/address')
      .set('Cookie', auth)
      .send({})
      .expect(400);
  });

  it('returns 404 if order not found', async () => {
    const auth = getAuthCookie();

    orderModel.findById.mockResolvedValue(null);

    await request(app)
      .patch('/api/orders/unknown/address')
      .set('Cookie', auth)
      .send({ shippingAddress: newAddress })
      .expect(404);
  });
});
