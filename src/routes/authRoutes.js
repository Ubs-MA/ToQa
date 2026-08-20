const express = require('express');
const { body } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const validate = require('../middlewares/validate');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');

const router = express.Router();

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new customer
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Ahmed
 *               email:
 *                 type: string
 *                 example: ahmed@gmail.com
 *               password:
 *                 type: string
 *                 example: 12345678
 *               phone:
 *                 type: string
 *                 example: "01012345678"
 *               role:
 *                 type: string
 *                 example: customer
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 */
router.post(
  '/register',
  [
    body('name').trim().notEmpty(),
    body('email').isEmail(),
    body('password').isLength({ min: 8 }),
    body('phone').optional().trim()
  ],
  validate,
  catchAsync(async (req, res) => {
    const { name, email, password, phone, role } = req.body;
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: role === 'admin' ? 'admin' : 'customer'
    });

    const token = signToken(user._id);
    res.status(201).json({ status: 'success', token, data: { user: { id: user._id, name, email, role: user.role } } });
  })
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in and receive a JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: emadtest@gmail.com
 *               password:
 *                 type: string
 *                 example: yourpassword
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Incorrect email or password
 */
router.post(
  '/login',
  [body('email').isEmail(), body('password').notEmpty()],
  validate,
  catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return next(new ApiError(401, 'Incorrect email or password'));
    }

    const token = signToken(user._id);
    res.status(200).json({ status: 'success', token, data: { user: { id: user._id, role: user.role } } });
  })
);

module.exports = router;
