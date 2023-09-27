const express = require("express");
const {body, query, param} = require("express-validator");

const User = require("../models/user");
const userController = require("../controllers/user");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

/**
 * @openapi
 * '/user/register':
 *  put:
 *     tags:
 *     - User
 *     summary: Register a user
 *     requestBody:
 *      required: true
 *      content:
 *        application/x-www-form-urlencoded:
 *           schema:
 *              $ref: '#/components/schemas/UserRegister'
 *     responses:
 *      201:
 *        description: Success. User Created Successfully!
 *        content:
 *          application/json:
 *            schema:
 *              userId:
 *                type: string
 *      422:
 *        description: Error in username, password or email.
 *        content:
 *          application/json:
 *            schema:
 *              ErrorArray:
 *                type: Array
 *      500:
 *        description: Bad request
 */
router.put(
    "/register",
    [
        body("name").trim().not().isEmpty(),
        body("email")
            .isEmail()
            .withMessage("Please enter a valid email.")
            .custom((value, {req}) => {
                return User.findOne({email: value}).then((userObject) => {
                    if (userObject) {
                        return Promise.reject("Email address already exists!");
                    }
                });
            })
            .normalizeEmail(),
        body("password").trim().isLength({min: 8}),
    ],
    userController.register
);

/**
 * @openapi
 * '/user/login':
 *  post:
 *     tags:
 *     - User
 *     summary: Login a user
 *     requestBody:
 *      required: true
 *      content:
 *        application/x-www-form-urlencoded:
 *           schema:
 *              $ref: '#/components/schemas/UserLogin'
 *     responses:
 *      200:
 *        description: Success. User Logged in Successfully!
 *        content:
 *          application/json:
 *            schema:
 *              token:
 *                type: JWT Token
 *              userId:
 *                type: string
 *      401:
 *        description: A user with this email could not be found or Wrong Password.
 *        content:
 *          application/json:
 *            schema:
 *              Error:
 *                type: string
 *      500:
 *        description: Bad request
 */
router.post("/login", userController.login);

/**
 * @openapi
 * '/user/logout':
 *  post:
 *     tags:
 *     - User
 *     summary: Login a user
 *     responses:
 *      200:
 *        description: Token Deleted!
 *      401:
 *        description: Token not in DB!
 *        content:
 *          application/json:
 *            schema:
 *              Error:
 *                type: string
 *      500:
 *        description: Bad request
 */
router.post("/logout", authMiddleware.authenticate, userController.logout);

/**
 * @openapi
 * '/user/role':
 *  get:
 *     tags:
 *     - User
 *     summary: Get user role by User ID.
 *     requestBody:
 *      required: true
 *      content:
 *        application/x-www-form-urlencoded:
 *           schema:
 *              userId:
 *                type: string
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *          application/json:
 *           schema:
 *              role:
 *                type: string
 *       404:
 *         description: User not found
 *       500:
 *         description: Bad request
 */
router.get(
    "/role/:userId",
    authMiddleware.authenticate,
    authMiddleware.authorize(["admin"]),
    [query("userId").trim().not().isEmpty()],
    userController.getUserRole
);
/**
 * @openapi
 * '/user/role':
 *  patch:
 *     tags:
 *     - User
 *     summary: Update user role by User ID.
 *     requestBody:
 *      required: true
 *      content:
 *        application/x-www-form-urlencoded:
 *           schema:
 *              userId:
 *                type: string
 *              role:
 *                type: string
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *          application/json:
 *           schema:
 *              message:
 *                type: string
 *       404:
 *         description: User not found
 *       500:
 *         description: Bad request
 */

router.patch(
    "/role",
    authMiddleware.authenticate,
    authMiddleware.authorize(["admin"]),
    [
        body("userId").trim().not().isEmpty(),
        body("role").trim().not().isEmpty().toLowerCase(),
    ],
    userController.updateUserRole
);

/**
 * @openapi
 * '/user/status':
 *  get:
 *     tags:
 *     - User
 *     summary: Get user status by User ID.
 *     requestBody:
 *      required: true
 *      content:
 *        application/x-www-form-urlencoded:
 *           schema:
 *              userId:
 *                type: string
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *          application/json:
 *           schema:
 *              status:
 *                type: string
 *       404:
 *         description: User not found
 *       500:
 *         description: Bad request
 */
router.get(
    "/status/:userId",
    authMiddleware.authenticate,
    authMiddleware.authorize(["admin"]),
    [query("userId").trim().not().isEmpty()],
    userController.getUserStatus
);

/**
 * @openapi
 * '/user/status':
 *  patch:
 *     tags:
 *     - User
 *     summary: Get user status by User ID.
 *     requestBody:
 *      required: true
 *      content:
 *        application/x-www-form-urlencoded:
 *           schema:
 *              userId:
 *                type: string
 *              status:
 *                type: string
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *          application/json:
 *           schema:
 *              message:
 *                type: string
 *       404:
 *         description: User not found
 *       500:
 *         description: Bad request
 */
router.patch(
    "/status",
    authMiddleware.authenticate,
    authMiddleware.authorize(["admin"]),
    [
        body("userId").trim().not().isEmpty(),
        body("status").trim().not().isEmpty().toLowerCase(),
    ],
    userController.updateUserStatus
);

/**
 * @openapi
 * '/user/allUsers':
 *  get:
 *     tags:
 *     - User
 *     summary: Get all users in the databse
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *          application/json:
 *           schema:
 *              $ref: '#/components/schema/UserInfo'
 *       404:
 *         description: User database empty.
 *       500:
 *         description: Bad request
 */
router.get(
    "/allUsers",
    authMiddleware.authenticate,
    authMiddleware.authorize(["admin"]),
    userController.getAllUsers
);

/**
 * @openapi
 * '/user/info':
 *  get:
 *     tags:
 *     - User
 *     summary: Get user by UserId
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             userId:
 *               type: string
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *          application/json:
 *           schema:
 *              $ref: '#/components/schema/UserInfo'
 *       404:
 *         description: User not found
 *       500:
 *         description: Bad request
 */
router.get(
    "/info/:userId",
    authMiddleware.authenticate,
    [query("userId").trim().not().isEmpty()],
    userController.getUserInfo
);

/**
 * @openapi
 * '/footprint/{carbonFootprint}':
 *  post:
 *     tags:
 *     - User
 *     summary: edit user carbonFootprint
 *     requestBody:
 *       required: true
 *       content:
 *           schema:
 *             carbonFootprint:
 *               type:: number
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: User not found
 *       500:
 *         description: Bad request
 */
router.post(
    "/footprint",
    authMiddleware.authenticate,
    userController.updateCarbonFootprint
);

/**
 * @openapi
 * '/user/current/info':
 *  get:
 *     tags:
 *     - User
 *     summary: Get current user info if one has logged in
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *          application/json:
 *           schema:
 *              $ref: '#/components/schema/UserInfo'
 *       404:
 *         description: User not found
 *       500:
 *         description: Bad request
 */
router.get(
    "/current/info",
    authMiddleware.authenticate,
    userController.getCurrentUserInfo
);

/**
 * @openapi
 * '/user/name':
 *  patch:
 *     tags:
 *     - User
 *     summary: Get user by UserId
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             userId:
 *               type: string
 *             name:
 *               type: strimg
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *          application/json:
 *           schema:
 *              message:
 *                type: String
 *       404:
 *         description: User not found
 *       500:
 *         description: Bad request
 */
router.patch(
    "/name",
    authMiddleware.authenticate,
    [body("userId").trim().not().isEmpty(), body("name").trim().not().isEmpty()],
    userController.updateUserName
);

/**
 * @openapi
 * '/user/password':
 *  patch:
 *     tags:
 *     - User
 *     summary: Get user by UserId
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             userId:
 *               type: string
 *             password:
 *               type: strimg
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *          application/json:
 *           schema:
 *              message:
 *                type: String
 *       404:
 *         description: User not found
 *       500:
 *         description: Bad request
 */
router.patch(
    "/password",
    authMiddleware.authenticate,
    [
        body("userId").trim().not().isEmpty(),
        // body("password").trim().isLength({min: 8})
        body("oldPassword").trim().not().isEmpty(),
        body("newPassword").trim().isLength({min: 8}),
    ],

    userController.updateUserPassword
);

/**
 * @swagger
 * /user/carbonInfo/{userId}:
 *   get:
 *     summary: Get carbon information for a user by ID
 *     parameters:
 *       - in: path
 *         name: userId
 *         description: ID of the user to retrieve carbon information for
 *         required: true
 *         schema:
 *           type: string
 *       - in: header
 *         name: Authorization
 *         description: Access token
 *         required: true
 *         type: string
 *         example: Bearer <access_token>
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Carbon information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalFunded:
 *                   type: number
 *                   description: Total amount of funding provided by the user
 *                 totalPanelsBought:
 *                   type: number
 *                   description: Total number of solar panels bought by the user
 *                 totalCarbonOffset:
 *                   type: number
 *                   description: Total carbon offset achieved by the user
 *                 payments:
 *                   type: array
 *                   description: List of payments made by the user
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: ID of the payment
 *                       amountFunded:
 *                         type: number
 *                         description: Amount of funding provided by the user for this payment
 *                       transactionTime:
 *                         type: integer
 *                         description: Timestamp of the transaction
 *                       carbonOffset:
 *                         type: number
 *                         description: Carbon offset achieved by this payment
 *                       panel:
 *                         type: object
 *                         description: Solar panel associated with this payment
 *                         properties:
 *                           type:
 *                             type: string
 *                             description: Type of solar panel
 *                           price:
 *                             type: number
 *                             description: Price of the solar panel
 *                       countryname:
 *                         type: string
 *                         description: Name of the country where the solar panel is installed
 *     tags:
 *       - Carbon Information
 */

router.get(
    "/carbonInfo/:userId",
    authMiddleware.authenticate,
    [
        param("userId").trim().not().isEmpty()
    ],
    userController.getCarbonInfo
);


/**
 * @openapi
 * '/user/staff/statistics':
 *  get:
 *     tags:
 *     - User
 *     summary: Get carbonInfo
 *     requestBody:
 *       required: false
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *          application/json:
 *           schema:
 *              $ref: '#/components/schema/CarbonInfo'
 *       404:
 *         description: source not found
 *       500:
 *         description: Bad request
 */
router.get(
    "/staff/statistics",
    authMiddleware.authenticate,
    authMiddleware.authorize(["staff"]),
    userController.getStatistics
);

module.exports = router;
