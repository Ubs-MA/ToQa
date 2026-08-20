const express = require('express');
const {
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  cancelOrder
} = require('../controllers/orderController');
const {
  uploadProof,
  getPaymentStatus,
  updatePaymentStatus
} = require('../controllers/paymentController');
const {
  updateStatusValidation,
  cancelOrderValidation,
  getOrderValidation
} = require('../validations/orderValidation');
const validate = require('../middlewares/validate');
const { protect } = require('../middlewares/auth');
const { restrictTo } = require('../middlewares/role');
const { uploadPaymentProof } = require('../middlewares/upload');

const router = express.Router();

router.use(protect);

// Customer routes
router.get('/my-orders', getMyOrders);
/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Get order details by ID
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order details retrieved successfully
 *       400:
 *         description: Invalid order ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 */
router.get('/:id', getOrderValidation, validate, getOrderById);

/**
 * @swagger
 * /orders/{id}/cancel:
 *   patch:
 *     summary: Cancel an order
 *     description: Customer can cancel their own pending order, admin can cancel any order
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order cancelled successfully
 *       400:
 *         description: Invalid order ID or order cannot be cancelled
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 */
router.patch('/:id/cancel', cancelOrderValidation, validate, cancelOrder);
// Payment sub-routes
router.post('/:id/payment-proof', getOrderValidation, validate, uploadPaymentProof, uploadProof);
/**
 * @swagger
 * /orders/{id}/payment-status:
 *   get:
 *     summary: Get the payment status of an order
 *     tags:
 *       - Payment
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Payment status retrieved successfully
 *       400:
 *         description: Invalid order ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 */
router.get('/:id/payment-status', getOrderValidation, validate, getPaymentStatus);
// Admin routes
router.get('/', restrictTo('admin'), getAllOrders);
router.patch('/:id/status', restrictTo('admin'), updateStatusValidation, validate, updateOrderStatus);
/**
 * @swagger
 * /orders/{id}/payment-status:
 *   patch:
 *     summary: Admin - confirm or update the payment status of an order
 *     tags:
 *       - Payment
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - paymentStatus
 *             properties:
 *               paymentStatus:
 *                 type: string
 *                 enum:
 *                   - pending
 *                   - paid
 *                   - failed
 *                 example: paid
 *     responses:
 *       200:
 *         description: Payment status updated successfully
 *       400:
 *         description: Invalid order ID or payment status
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Order not found
 */
router.patch('/:id/payment-status', restrictTo('admin'), getOrderValidation, validate, updatePaymentStatus);
module.exports = router;
