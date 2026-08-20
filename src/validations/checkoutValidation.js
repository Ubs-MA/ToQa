const { body } = require('express-validator');
const Order = require('../models/Order');

const checkoutValidation = [
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^01[0-2,5]{1}[0-9]{8}$/)
    .withMessage('Please provide a valid Egyptian phone number'),

  body('governorate').trim().notEmpty().withMessage('Governorate is required'),

  body('address')
    .trim()
    .notEmpty()
    .withMessage('Address is required')
    .isLength({ min: 5 })
    .withMessage('Address must be at least 5 characters'),

  body('deliveryNotes').optional().trim().isLength({ max: 500 }),
  body('orderNotes').optional().trim().isLength({ max: 500 }),

  body('paymentMethod')
    .trim()
    .notEmpty()
    .withMessage('Payment method is required')
    .isIn(Order.PAYMENT_METHODS)
    .withMessage(`Payment method must be one of: ${Order.PAYMENT_METHODS.join(', ')}`),

  body('walletPhone')
    .if(body('paymentMethod').equals('electronic_wallet'))
    .notEmpty()
    .withMessage('Wallet phone number is required for electronic wallet payments'),

  body('items').isArray({ min: 1 }).withMessage('Order must contain at least one item'),
  body('items.*.product').notEmpty().withMessage('Each item requires a product id'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Each item quantity must be a positive integer')
];

module.exports = checkoutValidation;
