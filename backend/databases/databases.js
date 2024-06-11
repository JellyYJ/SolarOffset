var mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const logger = require("../utils/logger");

const DB = process.env.DATABASE_HOST.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log("DB connetion successful");
  });

// mongoose.connect("mongodb://127.0.0.1:27017/solaroffset", {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
//   useCreateIndex: true,
// });

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", async () => {
  await addDefaultAdmin();
});

// add an admin user for the system
const addDefaultAdmin = async () => {
  const name = "admin";
  const email = "admin@sheffield.ac.uk";
  const password = "admin123";
  const role = "admin";
  const status = "enabled";
  try {
    const adminUser = await User.findOne({ email: email });
    if (adminUser) {
      console.log("Admin user exists");
      return;
    }
    // Hashing password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 12);
    // Creating new user object
    const newUser = new User({
      name: name,
      email: email,
      password: hashedPassword,
      role: role,
      status: status,
    });
    const result = await newUser.save(); // Saving default admin user to database
    logger.info({ message: "Admin created!", userId: result._id });
  } catch (err) {
    // Returning any other errors.
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    logger.error(err.message);
  }
};
