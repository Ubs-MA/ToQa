const { body, param } = require('express-validator');
const Order = require('../models/Order');

const mongoIdParam = (name = 'id') =>
  param(name).isMongoId().withMessage(`${name} must be a valid Mongo ID`);

const updateStatusValidation = [
  mongoIdParam('id'),
  body('status')
    .trim()
    .notEmpty()
    .withMessage('Status is required')
    .isIn(Order.STATUSES)
    .withMessage(`Status must be one of: ${Order.STATUSES.join(', ')}`),
  body('note').optional().trim().isLength({ max: 300 })
];

const cancelOrderValidation = [
  mongoIdParam('id'),
  body('reason').optional().trim().isLength({ max: 300 })
];

const getOrderValidation = [mongoIdParam('id')];

module.exports = { updateStatusValidation, cancelOrderValidation, getOrderValidation, mongoIdParam };
