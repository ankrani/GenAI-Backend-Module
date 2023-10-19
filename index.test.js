const request = require('supertest');
const { app } = require('./index');
const stripe = require('stripe')('sk_test_...'); // Replace with your own Stripe API key


describe('POST /register', () => {
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/register')
      .send({
        name: 'John Doe',
        email: 'johndoe@example.com',
        password: 'password123',
      });
    expect(res.statusCode).toEqual(200);
    expect(res.text).toEqual('Data inserted');
  });

  it('should return an error if email already exists', async () => {
    const res = await request(app)
      .post('/register')
      .send({
        name: 'Jane Doe',
        email: 'janedoe@example.com',
        password: 'password123',
      });
    expect(res.statusCode).toEqual(200);

    const res2 = await request(app)
      .post('/register')
      .send({
        name: 'John Doe',
        email: 'janedoe@example.com',
        password: 'password123',
      });
    expect(res2.statusCode).toEqual(400);
    expect(res2.body).toHaveProperty('message', 'Email already exists');
  });
});





describe('POST /payments/create', () => {
  it('should create a payment intent', async () => {
    const res = await request(app)
      .post('/payments/create')
      .query({ total: 1000 }); // Replace with your own total amount
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('clientSecret');
  });

  it('should return an error if total amount is invalid', async () => {
    const res = await request(app)
      .post('/payments/create')
      .query({ total: -1000 }); // Replace with an invalid total amount
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message', 'Invalid total amount');
  });

  it('should return an error if Stripe API key is invalid', async () => {
    const stripeMock = jest.spyOn(stripe.paymentIntents, 'create');
    stripeMock.mockImplementation(() => {
      throw new Error('Invalid API key');
    });

    const res = await request(app)
      .post('/payments/create')
      .query({ total: 1000 }); // Replace with your own total amount
    expect(res.statusCode).toEqual(500);
    expect(res.body).toHaveProperty('message', 'Error creating payment intent');

    stripeMock.mockRestore();
  });
});

