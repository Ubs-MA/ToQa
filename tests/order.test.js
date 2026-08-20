require('./setup');
const request = require('supertest');
const app = require('../src/app');
const Product = require('../src/models/Product');

const API = '/api/v1';

const register = async (email, role = 'customer') => {
  const res = await request(app)
    .post(`${API}/auth/register`)
    .send({ name: 'User', email, password: 'password123', phone: '01011111111', role });
  return { token: res.body.token, id: res.body.data.user.id };
};

const createOrder = async (token, productId, quantity = 1) => {
  const res = await request(app)
    .post(`${API}/checkout`)
    .set('Authorization', `Bearer ${token}`)
    .send({
      phone: '01098765432',
      governorate: 'Cairo',
      address: '123 Test street',
      paymentMethod: 'cash_on_delivery',
      items: [{ product: productId, quantity }]
    });
  return res.body.data.order;
};

describe('Orders API', () => {
  let customerToken;
  let adminToken;
  let product;

  beforeEach(async () => {
    const customer = await register('cust@test.com', 'customer');
    const admin = await register('admin@test.com', 'admin');
    customerToken = customer.token;
    adminToken = admin.token;
    product = await Product.create({ name: 'Shoes', price: 300, stock: 10 });
  });

  it('lets a customer fetch their own orders with pagination', async () => {
    await createOrder(customerToken, product._id.toString());
    await createOrder(customerToken, product._id.toString());

    const res = await request(app)
      .get(`${API}/orders/my-orders?page=1&limit=1`)
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.results).toBe(1);
    expect(res.body.pagination.total).toBe(2);
  });

  it('prevents a customer from viewing another customer order', async () => {
    const order = await createOrder(customerToken, product._id.toString());

    const other = await register('other@test.com', 'customer');
    const res = await request(app)
      .get(`${API}/orders/${order._id}`)
      .set('Authorization', `Bearer ${other.token}`);

    expect(res.status).toBe(403);
  });

  it('prevents a non-admin from listing all orders', async () => {
    const res = await request(app)
      .get(`${API}/orders`)
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(403);
  });

  it('allows admin to list all orders and filter by status', async () => {
    await createOrder(customerToken, product._id.toString());

    const res = await request(app)
      .get(`${API}/orders?status=pending`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.results).toBeGreaterThanOrEqual(1);
  });

  it('allows admin to update order status', async () => {
    const order = await createOrder(customerToken, product._id.toString());

    const res = await request(app)
      .patch(`${API}/orders/${order._id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'confirmed', note: 'Verified stock' });

    expect(res.status).toBe(200);
    expect(res.body.data.order.status).toBe('confirmed');
    expect(res.body.data.order.statusHistory.length).toBe(2);
  });

  it('rejects invalid status values', async () => {
    const order = await createOrder(customerToken, product._id.toString());

    const res = await request(app)
      .patch(`${API}/orders/${order._id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'teleported' });

    expect(res.status).toBe(422);
  });

  it('allows a customer to cancel their own pending order', async () => {
    const order = await createOrder(customerToken, product._id.toString());

    const res = await request(app)
      .patch(`${API}/orders/${order._id}/cancel`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ reason: 'Changed my mind' });

    expect(res.status).toBe(200);
    expect(res.body.data.order.status).toBe('cancelled');
  });

  it('prevents cancelling an already shipped order as customer', async () => {
    const order = await createOrder(customerToken, product._id.toString());

    await request(app)
      .patch(`${API}/orders/${order._id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'shipped' });

    const res = await request(app)
      .patch(`${API}/orders/${order._id}/cancel`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ reason: 'Too late' });

    expect(res.status).toBe(400);
  });
});
