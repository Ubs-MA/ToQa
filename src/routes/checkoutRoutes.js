const express = require('express');
const { checkout } = require('../controllers/checkoutController');
const checkoutValidation = require('../validations/checkoutValidation');
const validate = require('../middlewares/validate');
const { protect } = require('../middlewares/auth');
const { restrictTo } = require('../middlewares/role');

const router = express.Router();

router.use(protect, restrictTo('customer', 'admin'));

/**
 * @swagger
 * /checkout:
 *   post:
 *     summary: Create a checkout
 *     tags: [Checkout]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *               - governorate
 *               - address
 *               - paymentMethod
 *               - items
 *             properties:
 *               phone:
 *                 type: string
 *                 example: "01012345678"
 *               governorate:
 *                 type: string
 *                 example: "Cairo"
 *               address:
 *                 type: string
 *                 example: "Nasr City, Cairo"
 *               deliveryNotes:
 *                 type: string
 *                 example: "Please call before delivery"
 *               orderNotes:
 *                 type: string
 *                 example: "Handle with care"
 *               paymentMethod:
 *                 type: string
 *                 example: "cash"
 *               walletPhone:
 *                 type: string
 *                 example: "01012345678"
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - product
 *                     - quantity
 *                   properties:
 *                     product:
 *                       type: string
 *                       example: "PRODUCT_ID_HERE"
 *                     quantity:
 *                       type: integer
 *                       example: 2
 */
router.post('/', checkoutValidation, validate, checkout);

module.exports = router;
