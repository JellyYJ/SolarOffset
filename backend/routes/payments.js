const express = require("express");
const router = express.Router();

const paymentsController = require("../controllers/payments");
const authMiddleware = require("../middleware/auth");
const {query} = require("express-validator");

/**
 * @swagger
 * /payments/create-checkout-session:
 *
 *     post:
 *       summary: This url returns a new checkout session which is in the form of a stripe link.
 *       consumes:
 *         - application/x-www-form-urlencoded
 *       parameters:
 *         - in: formData
 *           name: price_id
 *           type: string
 *           description: price_id of the item in stripe.
 *       responses:
 *         200:
 *           description: OK
 *
 */
router.post("/create-checkout-session", paymentsController.generatePaymentUrl);

/**
 * @swagger
 * /payments/validate-payment:
 *   post:
 *
 *       summary: This url validates the status of a payment
 *       consumes:
 *         - application/x-www-form-urlencoded
 *       parameters:
 *         - in: formData
 *           name: sessionId
 *           type: string
 *           description: session_id passed in the URL.
 *       responses:
 *         200:
 *           description: OK
 *
 */
router.post(
    "/validate-payment",
    authMiddleware.allowGuests,
    paymentsController.validatePaymentStatus
);

/**
 * @swagger
 * /payments/allPayments:
 *   get:
 *
 *       summary: This url gets all the payments in the database
 *       responses:
 *         200:
 *           description: All the payments in the DB.
 *
 */
router.get(
    "/allPayments",
    authMiddleware.authenticate,
    authMiddleware.authorize(["staff", "admin"]),
    paymentsController.getAllPayments
);

/**
 * @swagger
 * /payments/paymentsByEmail:
 *   get:
 *       summary: This url returns all the payments by email.
 *       consumes:
 *         - application/x-www-form-urlencoded
 *       parameters:
 *         - in: formData
 *           name: email
 *           type: string
 *           description: email to search for.
 *       responses:
 *         200:
 *           description: OK
 *
 */
router.get(
    "/paymentsByEmail/:email",
    authMiddleware.authenticate,
    [query("email").trim().not().isEmpty()],
    paymentsController.getPaymentsByEmail
);

module.exports = router;
