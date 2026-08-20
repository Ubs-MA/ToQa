require('./setup');
const request = require('supertest');
const app = require('../src/app');
const Product = require('../src/models/Product');

const API = '/api/v1';

const register = async (email, role = 'customer') => {
  const res = await request(app)
    .post(`${API}/auth/register`)
    .send({ name: 'User', email, password: 'password123', phone: '01011111111', role });
  return { token: res.body.token };
};

describe('Payment API', () => {
  let customerToken;
  let adminToken;
  let orderId;

  beforeEach(async () => {
    const customer = await register('cust2@test.com', 'customer');
    const admin = await register('admin2@test.com', 'admin');
    customerToken = customer.token;
    adminToken = admin.token;

    const product = await Product.create({ name: 'Bag', price: 500, stock: 10 });

    const checkoutRes = await request(app)
      .post(`${API}/checkout`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        phone: '01098765432',
        governorate: 'Cairo',
        address: '123 Test street',
        paymentMethod: 'electronic_wallet',
        walletPhone: '01098765432',
        items: [{ product: product._id.toString(), quantity: 1 }]
      });

    orderId = checkoutRes.body.data.order._id;
  });

  it('returns the payment status for the order owner', async () => {
    const res = await request(app)
      .get(`${API}/orders/${orderId}/payment-status`)
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.paymentMethod).toBe('electronic_wallet');
    expect(res.body.data.paymentStatus).toBe('pending');
  });

  it('allows admin to confirm payment and auto-advances order status', async () => {
    const res = await request(app)
      .patch(`${API}/orders/${orderId}/payment-status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ paymentStatus: 'paid' });

    expect(res.status).toBe(200);
    expect(res.body.data.order.paymentStatus).toBe('paid');
    expect(res.body.data.order.status).toBe('confirmed');
  });

  it('rejects an invalid payment status value', async () => {
    const res = await request(app)
      .patch(`${API}/orders/${orderId}/payment-status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ paymentStatus: 'not-a-real-status' });

    expect(res.status).toBe(422);
  });

  it('prevents a non-owner customer from checking payment status', async () => {
    const other = await register('other2@test.com', 'customer');
    const res = await request(app)
      .get(`${API}/orders/${orderId}/payment-status`)
      .set('Authorization', `Bearer ${other.token}`);

    expect(res.status).toBe(403);
  });
});
