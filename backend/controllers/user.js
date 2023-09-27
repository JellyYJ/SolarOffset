const {validationResult} = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const logger = require("../utils/logger");
const User = require("../models/user");
const Payment = require("../models/payments");
const paymentsController = require("./payments");
const country_controller = require("../controllers/country");

exports.register = async (req, res, next) => {
    // First the validation errors are extracted.
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error("Validation failed.");
        error.statusCode = 422;
        error.data = errors.array();
        logger.warn(errors.array()); // Logging warning of the validation errors.
        return res.status(422).json(errors.array()); // Return errors to frontend.
    }
    const name = req.body.name; // Name
    const email = req.body.email; // Email
    const password = req.body.password; // Password
    const role = "user"; // Default role - User
    const status = "enabled"; // Default status - enabled
    const carbonFootprint = 8000; // Default carbonFootprint - Uk average
    try {
        // Hashing password using bcrypt
        const hashedPassword = await bcrypt.hash(password, 12);
        // Creating new user object
        const newUser = new User({
            name: name,
            email: email,
            password: hashedPassword,
            role: role,
            status: status,
            carbonFootprint: carbonFootprint,
        });
        const result = await newUser.save(); // Saving new user to database
        logger.info({message: "User created!", userId: result._id}); // Logging user created message.
        return res.status(201).json({message: "User created!", userId: result._id}); // returning user id as result.
    } catch (err) {
        // Returning any other errors.
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        logger.error(err.message); // Logging any other error that occurs.
        return res.status(err.statusCode).json({Error: err.message});
    }
};

exports.login = async (req, res, next) => {
    // Extracting email and password
    const email = req.body.email;
    const password = req.body.password;

    let loadedUser;
    try {
        // Finding user from database
        const user = await User.findOne({email: email});
        // Returning an error if user does not exist.
        if (!user) {
            const error = new Error("A user with this email could not be found.");
            logger.warn(error.message); // Logging email not found error.
            return res.status(401).json({Error: error.message});
        }

        if (user.status === 'disabled') {
            const error = new Error('User has been disabled by admin!');
            logger.warn(error);
            return res.status(401).json({Error: error.message});
        }
        loadedUser = user;
        // Validating password
        const isEqual = await bcrypt.compare(password, user.password);
        if (!isEqual) {
            const error = new Error('Wrong password!');
            logger.warn(error.message); // Logging wrong password error.
            return res.status(401).json({Error: error.message});
        }
        const jwtTokenKey = process.env.JWT_TOKEN_KEY
        // Creating new token with email, userId, role and status.
        const token = jwt.sign(
            {
                email: loadedUser.email,
                userId: loadedUser._id.toString(),
                role: loadedUser.role,
                status: loadedUser.status
            },
            jwtTokenKey,
            {expiresIn: '14d'}
        );
        // // Add auth token to DB.
        // user.tokens = user.tokens.concat({token})

        await user.save();
        // Logging user login.
        logger.info("User logged in!", {email: loadedUser.email, name: loadedUser.name})
        // store JWT into Cookie
        res.cookie('jwt', token, {maxAge: 14 * 60 * 60 * 1000})
        // Returning token and user id upon successful login.
        return res.status(200).json({
            token: token,
            userId: loadedUser._id.toString()
        });
    } catch (err) {
        // Returning any other errors.
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        logger.error(err.message); // Logging any other error that occurs.
        next(err);
        return err;
    }
};

exports.logout = async (req, res, next) => {
    try {
        // const user = await User.findOne({_id: req.userId});
        // for (let i = 0; i < user.tokens.length; i++) {
        //     token = user.tokens[i];
        //     if (token.token === req.token) {
        //         user.tokens.splice(i, 1);
        //     }
        // }
        // await user.save();
        res.clearCookie("jwt");
        return res.status(200).send("Successfully Logout!");
    } catch (error) {
        console.log(error);
        res.status(500).send();
    }
};

exports.getUserRole = async (req, res, next) => {
    try {
        // Searching for userId in the database
        const userId = req.params.userId;
        const user = await User.findById(userId);
        // If the user does not exist in the database.
        if (!user) {
            const error = new Error("User not found.");
            logger.warn(error); // Logging user not found error.
            return res.status(404).json({Error: error.message});
        }
        logger.info({userId: userId, role: user.role}); // Logging user role.
        // Return the role of the user as a json.
        return res.status(200).json({role: user.role});
    } catch (err) {
        // Returning any other errors.
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        logger.error(err.message); // Logging any other error that occurs.
        return res.status(err.statusCode).json({Error: err.message});
    }
};

exports.updateUserRole = async (req, res, next) => {
    try {
        const newRole = req.body.role;
        const userId = req.body.userId;
        // Searching for userId in the database
        const user = await User.findById(userId);
        // If the user does not exist in the database
        if (!user) {
            const error = new Error("User not found.");
            logger.warn(error); // Logging user not found error.
            return res.status(404).json({Error: error.message});
        }
        // Adding the new role to the user and saving the user.
        user.role = newRole;
        await user.save();
        logger.info({
            message: "User role updated to - " + newRole + ".",
            userId: userId,
            role: user.role,
        }); // Logging new user role.
        return res
            .status(200)
            .json({message: "User role updated to - " + newRole + "."});
    } catch (err) {
        // Returning any other errors.
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        logger.error(err.message); // Logging any other error that occurs.
        return res.status(err.statusCode).json({Error: err.message});
    }
};

exports.getUserStatus = async (req, res, next) => {
    try {
        const userId = req.params.userId;
        // Searching for userId in the database
        const user = await User.findById(userId);
        // If the user does not exist in the database
        if (!user) {
            const error = new Error("User not found.");
            logger.warn(error); // Logging user not found error.
            return res.status(404).json({Error: error.message});
        }
        logger.info({userId: userId, role: user.status}); // Logging user status.
        // Returning user status as a JSON to the frontend.
        return res.status(200).json({status: user.status});
    } catch (err) {
        // Returning any other errors.
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        logger.error(err.message); // Logging any other error that occurs.
        return res.status(err.statusCode).json({Error: err.message});
    }
};

exports.updateUserStatus = async (req, res, next) => {
    try {
        const newStatus = req.body.status;
        const userId = req.body.userId;
        // Searching for userId in the database
        const user = await User.findById(userId);
        // If the user does not exist in the database
        if (!user) {
            const error = new Error("User not found.");
            logger.warn(error); // Logging user not found error.
            return res.status(404).json({Error: error.message});
        }
        // Saving the new status to the user.
        user.status = newStatus;
        await user.save();
        logger.info({
            message: "User status updated to - " + newStatus + ".",
            userId: userId,
            role: user.status,
        }); // Logging new user role.
        return res
            .status(200)
            .json({message: "User status updated to - " + newStatus + "."});
    } catch (err) {
        // Returning any other errors.
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        logger.error(err.message); // Logging any other error that occurs.
        return res.status(err.statusCode).json({Error: err.message});
    }
};

exports.getAllUsers = async (req, res, next) => {
    try {
        // Retreiving all the users from the database.
        const users = await User.find({}).select(
            "name email role status totalFunded totalPanelsBought totalCarbonOffset updatedAt"
        );
        // If the database is empty.
        if (users.length === 0) {
            const error = new Error("User db empty.");
            logger.warn(error); // Logging database empty error.
            return res.status(404).json({Error: error.message});
        }
        logger.info("User retrieved all users.", {
            userId: req.userId,
            role: req.role,
        }); // Logging user who retrieved all users.
        return res.status(200).json(users); // Returning the users to the frontend.
    } catch (err) {
        // Returning any other errors.
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        logger.error(err.message); // Logging any other error that occurs.
        return res.status(err.statusCode).json({Error: err.message});
    }
};

exports.getUserInfo = async (req, res, next) => {
    try {
        const userId = req.params.userId;
        // Searching for userId in the database
        const user = await User.findById(userId).select(
            "name email role status totalFunded totalPanelsBought totalCarbonOffset createdAt updatedAt"
        );
        // If the database is empty.
        if (!user) {
            const error = new Error("User does not exist!");
            logger.warn(error); // Logging user not found error.
            return res.status(404).json({Error: error.message});
        } else {
            logger.info("User retrieved user:" + userId, {
                userId: req.userId,
                role: req.role,
            }); // Logging user who retrieved user.
            return res.status(200).json(user); // Returning the users to the frontend.
        }
    } catch (err) {
        if (!err.statusCode) {
            // Returning any other errors.
            err.statusCode = 500;
        }
        logger.error(err.message); // Logging any other error that occurs.
        return res.status(err.statusCode).json({Error: err.message});
    }
};

exports.updateCarbonFootprint = async (req, res, next) => {
    try {
        const userId = req.userId;
        const carbonFootprint = req.body.carbonFootprint;
        // Searching for userId in the database
        const user = await User.findById(userId);
        // If the database is empty.
        if (!user) {
            const error = new Error("User does not exist!");
            logger.warn(error); // Logging user not found error.
            return res.status(404).json({Error: error.message});
        } else {
            const error = new Error("Same value");
            logger.warn(error);
            if (user.carbonFootprint == carbonFootprint) {
                return res.status(500).json({Error: error.message});
            }
            user.carbonFootprint = carbonFootprint;
            await user.save();

            return res.status(200).json({Message: "success", newValue: user.carbonFootprint}) // Returning the users to the frontend.
        }
    } catch (err) {
        if (!err.statusCode) {
            // Returning any other errors.
            err.statusCode = 500;
        }
        logger.error(err.message); // Logging any other error that occurs.
        return res.status(err.statusCode).json({Error: err.message});
    }
};

exports.getCurrentUserInfo = async (req, res, next) => {
    try {
        const userId = req.userId;
        // Searching for userId in the database
        const user = await User.findById(userId).select(
            "name email role status totalFunded totalPanelsBought totalCarbonOffset createdAt updatedAt carbonFootprint"
        );
        // If the database is empty.
        if (!user) {
            const error = new Error("User does not exist!");
            logger.warn(error); // Logging user not found error.
            return res.status(404).json({Error: error.message});
        } else {
            logger.info("User retrieved user:" + userId, {
                userId: req.userId,
                role: req.role,
            }); // Logging user who retrieved user.
            return res.status(200).json(user); // Returning the users to the frontend.
        }
    } catch (err) {
        if (!err.statusCode) {
            // Returning any other errors.
            err.statusCode = 500;
        }
        logger.error(err.message); // Logging any other error that occurs.
        return res.status(err.statusCode).json({Error: err.message});
    }
}

exports.updateUserName = async (req, res, next) => {
    try {
        const newName = req.body.name;
        const userId = req.body.userId;
        // Searching for userId in the database
        const user = await User.findById(userId);
        // If the user does not exist in the database
        if (!user) {
            const error = new Error("User not found.");
            logger.warn(error); // Logging user not found error.
            return res.status(404).json({Error: error.message});
        }
        // Saving the new status to the user.
        user.name = newName;
        await user.save();
        logger.info("User name changed for:" + userId, {
            userId: userId,
            name: user.name,
        }); // Logging user who changed names.
        return res
            .status(200)
            .json({message: "User name updated to - " + newName + "."});
    } catch (err) {
        // Returning any other errors.
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        logger.error(err.message); // Logging any other error that occurs.
        return res.status(err.statusCode).json({Error: err.message});
    }
};

exports.updateUserPassword = async (req, res, next) => {
    try {
        const oldPassword = req.body.oldPassword;
        const newPassword = req.body.newPassword;
        const userId = req.body.userId;
        // Searching for userId in the database
        const user = await User.findById(userId);
        // If the user does not exist in the database
        if (!user) {
            const error = new Error("User not found.");
            logger.warn(error); // Logging user not found error.
            return res.status(404).json({Error: error.message});
        }
        // Check that oldPassword provided by the user matches their current one in DB
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            const error = new Error("The passoword you provided is incorrect");
            logger.warn(error);
            return res.status(400).json({Error: error.message});
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);
        // Saving the new status to the user.
        user.password = hashedPassword;
        await user.save();
        logger.info("User password changed for:" + userId, {userId: userId}); // Logging user who changed his password.
        return res
            .status(200)
            .json({message: "User password changed successfully!"});
    } catch (err) {
        // Returning any other errors.
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        logger.error(err.message); // Logging any other error that occurs.
        return res.status(err.statusCode).json({Error: err.message});
    }
};

exports.updateUserData = async (
    email,
    fundedAmount,
    carbonoffset,
    numPanels
) => {
    const user = await User.findOne({email: email});
    // If the user does not exist in the database
    if (!user) {
        const error = new Error("User not found.");
        logger.warn(error); // Logging user not found error.
        return false;
    }
    // update user data
    user.totalFunded = user.totalFunded + fundedAmount;
    user.totalCarbonOffset = user.totalCarbonOffset + carbonoffset;
    user.totalPanelsBought = user.totalPanelsBought + numPanels;
    await user.save();
    return true;
};

exports.getCarbonInfo = async (req, res, next) => {
    try {
        const userId = req.params.userId;
        // Searching for userId in the database
        const user = await User.findOne({_id: userId});
        // If the user does not exist in the database
        if (!user) {
            const error = new Error("User not found.");
            logger.warn(error); // Logging user not found error.
            return res.status(404).json({Error: error.message});
        }
        const userEmail = user.email;
        const payments = await paymentsController.getPaymentByEmail(userEmail);

        dealPaymentData(payments);

        const {totalFunded, totalPanelsBought, totalCarbonOffset} = user;
        const carbonInfo = {
            totalFunded,
            totalPanelsBought,
            totalCarbonOffset,
            payments,
        };

        return res.send(carbonInfo); // Returning the payments to the frontend.
    } catch (err) {
        // Returning any other errors.
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        logger.error(err.message); // Logging any other error that occurs.
        return res.status(err.statusCode).json({Error: err.message});
    }
};


exports.getStatistics = async (req, res, next) => {
    try {
        const totalCarbonInfo = await getTotalCarbonInfoOfUser();
        addtotalTree(totalCarbonInfo);
        const countriesData = await getCountriesData();
        return res.json({totalCarbonInfo, countriesData});
    } catch (err) {
        if (!err.statusCode) {
            // Returning any other errors.
            err.statusCode = 500;
        }
        logger.error(err.message); // Logging any other error that occurs.
        return res.status(err.statusCode).json({Error: err.message});
    }
};

function addtotalTree(totalCarbonInfo) {
    const totalTree = country_controller.carbonToTrees(totalCarbonInfo.totalCarbonOffset);
    totalCarbonInfo.totalTree = totalTree;
}

async function getCountriesData() {
    const result = await Payment.aggregate([
        {
            $addFields: {
                countryId: {$toObjectId: "$countryId"},
            },
        },
        {
            $group: {
                _id: "$countryId",
                totalFunded: {$sum: "$amountFunded"},
                totalCarbon: {$sum: "$carbonOffset"},
            },
        },
        {
            $lookup: {
                from: "countries",
                localField: "_id",
                foreignField: "_id",
                as: "country",
            },
        },
        {
            $addFields: {
                country: {$arrayElemAt: ["$country", 0]},
            },
        },
        {
            $project: {
                _id: 1,
                name: "$country.name",
                carbonIntensity: "$country.carbonIntensity",
                carbonBenefits: "$country.carbonBenefits",
                pvout: "$country.pvout",
                installedCapacity: "$country.installedCapacity",
                totalFunded: 1,
                totalCarbon: 1,
            },
        },
    ]);

    return result;
}

async function getTotalCarbonInfoOfUser() {
    const result = await User.aggregate([
        {
            $group: {
                _id: null,
                totalFunded: {$sum: "$totalFunded"},
                totalPanelsBought: {$sum: "$totalPanelsBought"},
                totalCarbonOffset: {$sum: "$totalCarbonOffset"},
                carbonFootprint: {$sum: "$carbonFootprint"},
            },
        },
    ]);

    return result[0];
}

function dealPaymentData(payments) {
    // Iterate through each payment
    for (let i = 0; i < payments.length; i++) {
        const paymentObj = payments[i];

        const country = paymentObj.country;
        // Find the panel object with the same _id and panelId
        const panelObj = country.solarPanels.find(
            (panel) => panel._id == paymentObj.panelId
        );

        // Create a new panel object with only the type and price fields
        const newPanelObj = {
            type: panelObj.type,
            price: panelObj.price,
        };

        // Replace the panelId with the new panel object
        paymentObj.panel = newPanelObj;

        // Extract the name field from country and add it to payment as countryname
        paymentObj.countryname = country.name;

        // Remove the country property from payment
        delete paymentObj.country;
        delete paymentObj.panelId;
    }
}
