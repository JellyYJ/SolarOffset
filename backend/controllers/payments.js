const logger = require("../utils/logger");
// require('dotenv').config()
const stripe_key = process.env.STRIPE_API_KEY;
const stripe = require("stripe")(stripe_key);
const YOUR_DOMAIN =
  (process.env.FRONT_END_HOST || "http://localhost:8000") + "/countries";
const Payment = require("../models/payments");
const userController = require("../controllers/user");
const carbonController = require("./carbon");

exports.generatePaymentUrl = async (req, res, next) => {
  const { countryId, price, panelId, country } = req.body;
  const amountToCharge = price * 100;
  const productId = "prod_NmDpguXZxp8Y5z";
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            unit_amount: amountToCharge,
            currency: "gbp",
            product: productId,
          },
          quantity: 1,
        },
      ],
      submit_type: "donate",
      success_url: `${YOUR_DOMAIN}/${countryId}?success=true&session_id={CHECKOUT_SESSION_ID}&panel_id=${panelId}&countryId=${countryId}&country=${country}`,
      cancel_url: `${YOUR_DOMAIN}/${countryId}?canceled=true`,
    });
    logger.info("Created new payments session");
    // res.redirect(303, session.url);
    return res.json({ url: session.url });
  } catch (err) {
    // Returning any other errors.
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    logger.error(err.message); // Logging any other error that occurs.
    return res.status(err.statusCode).json({ Error: err.message });
  }
};

exports.validatePaymentStatus = async (req, res, next) => {
  const sessionId = req.body.sessionId;

  try {
    const name = req.user ? req.user.name : "";
    const email = req.user ? req.user.email : "";
    const userId = req.userId || "";
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status === "paid") {
      const newPayment = new Payment({
        // name: session.customer_details.name,
        // email: session.customer_details.email,
        // save name and email for login user
        name: name,
        email: email,
        userId: userId,
        amountFunded: session.amount_total / 100.0, // the amount returned by session is multiplied by 100
        transactionTime: session.expires_at,
        paymentStatus: session.payment_status,
        sessionId: sessionId,
        status: session.status,
        panelId: req.body.panelId,
        countryId: req.body.countryId,
        country: req.body.country,
      });
      const result = await newPayment.save();
      const numPanels = await carbonController.setCarbonOffset(result);
      // await userController.updateUserData(session.customer_details.email, session.amount_total, result.carbonOffset, numPanels);
      if (userId) {
        await userController.updateUserData(
          email,
          session.amount_total / 100.0,
          result.carbonOffset,
          numPanels
        );
      }
      logger.info({ message: "Payment saved!", paymentId: result._id });
      return res
        .status(201)
        .json({ message: "Payment saved!", payment: result });
    } else {
      return res
        .status(500)
        .json({
          payment_status: session.payment_status,
          status: session.status,
        });
    }
  } catch (err) {
    // Returning any other errors.
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    logger.error(err.message); // Logging any other error that occurs.
    return res.status(err.statusCode).json({ Error: err.message });
  }
};

exports.getAllPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find({});
    // If the database is empty.
    if (payments.length === 0) {
      const error = new Error("Payments db empty.");
      logger.warn(error); // Logging database empty error.
      return res.status(404).json({ Error: error.message });
    }
    logger.info("User retrieved all payments.", {
      userId: req.userId,
      role: req.role,
    }); // Logging user who retrieved all users.
    return res.status(200).json(payments); // Returning the users to the frontend.
  } catch (err) {
    // Returning any other errors.
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    logger.error(err.message); // Logging any other error that occurs.
    return res.status(err.statusCode).json({ Error: err.message });
  }
};

exports.getPaymentsByEmail = async (req, res, next) => {
  const userEmail = req.params.email;
  try {
    const payments = await Payment.find({ email: userEmail });
    // If the database is empty.
    if (payments.length === 0) {
      const error = new Error("No Payments exist.");
      logger.warn(error); // Logging database empty error.
      return res.status(404).json({ Error: error.message });
    }
    logger.info("User retrieved payments by email.", {
      userId: req.userId,
      role: req.role,
      email: userEmail,
    }); // Logging user who retrieved all users.
    return res.status(200).json(payments); // Returning the payments to the frontend.
  } catch (err) {
    // Returning any other errors.
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    logger.error(err.message); // Logging any other error that occurs.
    return res.status(err.statusCode).json({ Error: err.message });
  }
};

exports.getPaymentByEmail = async (userEmail) => {
  try {
    const payments = await Payment.aggregate([
      {
        $addFields: {
          countryId: { $toObjectId: "$countryId" },
        },
      },
      {
        $match: { email: userEmail },
      },
      {
        $lookup: {
          from: "countries",
          localField: "countryId",
          foreignField: "_id",
          as: "country",
        },
      },
      {
        $unwind: "$country",
      },
      {
        $project: {
          amountFunded: 1,
          transactionTime: 1,
          createdAt: 1,
          carbonOffset: 1,
          panelId: 1,
          "country.name": 1,
          "country.solarPanels": 1,
        },
      },
    ]);

    return payments;
  } catch (err) {
    throw new Error(
      `Failed to get payments for email ${userEmail}: ${err.message}`
    );
  }
};
