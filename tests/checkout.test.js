require('./setup');
const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const Product = require('../src/models/Product');

const API = '/api/v1';

const registerAndLogin = async (overrides = {}) => {
  const res = await request(app)
    .post(`${API}/auth/register`)
    .send({
      name: 'Test Customer',
      email: overrides.email || 'customer@test.com',
      password: 'password123',
      phone: '01012345678',
      role: overrides.role || 'customer'
    });
  return { token: res.body.token, userId: res.body.data.user.id };
};

describe('Checkout API', () => {
  let token;
  let product;

  beforeEach(async () => {
    const auth = await registerAndLogin();
    token = auth.token;
    product = await Product.create({ name: 'T-Shirt', price: 200, stock: 5 });
  });

  it('rejects checkout without authentication', async () => {
    const res = await request(app).post(`${API}/checkout`).send({});
    expect(res.status).toBe(401);
  });

  it('validates required checkout fields', async () => {
    const res = await request(app)
      .post(`${API}/checkout`)
      .set('Authorization', `Bearer ${token}`)
      .send({ phone: '', governorate: '', address: '', paymentMethod: 'cash_on_delivery', items: [] });

    expect(res.status).toBe(422);
    expect(res.body.status).toBe('fail');
  });

  it('rejects checkout when stock is insufficient', async () => {
    const res = await request(app)
      .post(`${API}/checkout`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        phone: '01098765432',
        governorate: 'Cairo',
        address: '123 Test street, downtown',
        paymentMethod: 'cash_on_delivery',
        items: [{ product: product._id.toString(), quantity: 999 }]
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Insufficient stock/i);
  });

  it('creates an order with correct final price calculation for COD', async () => {
    const res = await request(app)
      .post(`${API}/checkout`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        phone: '01098765432',
        governorate: 'Cairo',
        address: '123 Test street, downtown',
        deliveryNotes: 'Leave at door',
        paymentMethod: 'cash_on_delivery',
        items: [{ product: product._id.toString(), quantity: 2 }]
      });

    expect(res.status).toBe(201);
    expect(res.body.data.order.itemsPrice).toBe(400);
    expect(res.body.data.order.totalPrice).toBe(450); // 400 + 50 shipping
    expect(res.body.data.order.paymentStatus).toBe('pending');
    expect(res.body.data.order.status).toBe('pending');

    const updatedProduct = await Product.findById(product._id);
    expect(updatedProduct.stock).toBe(3); // 5 - 2
  });

  it('creates an order and initiates electronic wallet payment', async () => {
    const res = await request(app)
      .post(`${API}/checkout`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        phone: '01098765432',
        governorate: 'Giza',
        address: '456 Another street',
        paymentMethod: 'electronic_wallet',
        walletPhone: '01098765432',
        items: [{ product: product._id.toString(), quantity: 1 }]
      });

    expect(res.status).toBe(201);
    expect(res.body.data.order.paymentMethod).toBe('electronic_wallet');
    expect(res.body.data.order.paymentReference).toMatch(/^PAY-/);
  });
});
