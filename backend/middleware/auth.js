const jwt = require("jsonwebtoken");
const User = require("../models/user");
// require('dotenv').config()

const getUserAuth = async (req, res, next, token) => {
  let decodedToken;
  try {
    const jwtTokenKey = process.env.JWT_TOKEN_KEY;
    decodedToken = jwt.verify(token, jwtTokenKey);
  } catch (error) {
    error.statusCode = 500;
    return res.status(error.statusCode).send(error.message);
  }
  if (!decodedToken) {
    const error = new Error("Not authenticated.");
    error.statusCode = 401;
    return res.status(error.statusCode).send(error.message);
  }
  const user = await User.findOne({ _id: decodedToken.userId });
  if (!user) {
    const error = new Error("User does not exist.");
    error.statusCode = 401;
    res.clearCookie("jwt");
    return res.status(error.statusCode).send(error.message);
  }
  req.userId = decodedToken.userId;
  req.role = decodedToken.role;
  req.user = user;
  req.token = token;
  next();
};

exports.authenticate = async (req, res, next) => {
  // const authHeader = req.get('Authorization');
  // if (!authHeader) {
  //     const error = new Error('Not authenticated.');
  //     error.statusCode = 401;
  //     throw error;
  // }
  // const token = authHeader.split(' ')[1];

  const cookies = req.cookies;
  const token = cookies ? cookies.jwt : "";
  if (!token) {
    const error = new Error("Token not available.");
    error.statusCode = 401;
    return res.status(error.statusCode).send(error.message);
  } else {
    await getUserAuth(req, res, next, token);
  }
};

// middleware allows guests
exports.allowGuests = async (req, res, next) => {
  const cookies = req.cookies;
  const token = cookies ? cookies.jwt : "";
  if (!token) {
    next();
  } else {
    await getUserAuth(req, res, next, token);
  }
};

exports.authorize = (permittedRoles) => {
  return (req, res, next) => {
    const userRole = req.role;
    let isPermitted = false;
    permittedRoles.map((role) => {
      if (userRole.includes(role)) {
        isPermitted = true;
      }
    });
    if (isPermitted) {
      return next();
    } else {
      return res
        .status(401)
        .send({ message: "You are not authorized to perform the action!" });
    }
  };
};
