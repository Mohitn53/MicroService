jest.mock('axios');
const axios = require('axios');

jest.mock('../src/models/order.model', () => ({
  create: jest.fn()
}));
const orderModel = require('../src/models/order.model');

const request = require('supertest');
const app = require('../src/app');
const { getAuthCookie } = require('./setup/auth');

beforeEach(() => {
  axios.get.mockImplementation((url) => {
    if (url.includes('/api/cart/me')) {
      return Promise.resolve({
        data: {
          cart: {
            items: [
              { productId: '65a1234567890abcdef1234', quantity: 2 }
            ]
          }
        }
      });
    }

    if (url.includes('/products/')) {
      return Promise.resolve({
        data: {
          data: {
            _id: '65a1234567890abcdef1234',
            title: 'Test Product',
            stock: 10,
            price: { amount: 500, currency: 'INR' }
          }
        }
      });
    }
  });

  orderModel.create.mockResolvedValue({
    _id: 'order123',
    user: 'user123',
    status: 'PENDING',
    items: [
      {
        product: '65a1234567890abcdef1234',
        quantity: 2,
        price: { amount: 500, currency: 'INR' }
      }
    ],
    totalprice: { amount: 1000, currency: 'INR' },
    shippingAddress: {
      street: '123 Main St',
      city: 'Metropolis',
      state: 'CA',
      zipcode: '90210',
      country: 'USA'
    }
  });
});

describe('POST /api/orders — Create order from current cart', () => {
  const sampleAddress = {
    street: '123 Main St',
    city: 'Metropolis',
    state: 'CA',
    pincode: '90210',
    country: 'USA',
  };

  it('creates order from current cart', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Cookie', getAuthCookie())
      .send({ shippingAddress: sampleAddress })
      .expect(201);

    expect(res.body.order.status).toBe('PENDING');
  });

  it('returns 422 when shipping address is missing', async () => {
    await request(app)
      .post('/api/orders')
      .set('Cookie', getAuthCookie())
      .send({})
      .expect(400);
  });
});
