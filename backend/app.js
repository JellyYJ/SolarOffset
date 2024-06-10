let createError = require("http-errors");
let express = require("express");
if (process.env.NODE_ENV === "production") {
  // production env
  require("dotenv").config({ path: ".env.prod" });
} else {
  // development env
  require("dotenv").config({ path: ".env" });
}
let path = require("path");
let cookieParser = require("cookie-parser");
let logger = require("morgan");
const swaggerUi = require("swagger-ui-express");
const specs = require("./swaggerConfig.js");
const cors = require("cors");
const compression = require("compression");
const helmet = require("helmet");

let indexRouter = require("./routes/index");
let userRoutes = require("./routes/user");
let carbonRouter = require("./routes/carbon");
let paymentsRouter = require("./routes/payments");
let countryRouter = require("./routes/country");

let app = express();

//add swagger config
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

// Compress all the texts sending to the client
app.use(compression());
// Set security HTTP headers
app.use(helmet());

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
if (process.env.NODE_ENV === "production") {
  // production env
  app.use(express.static(path.join(__dirname, "dist")));
  // allow dynamic router using dist of front end
  app.get("/countries/:id", (req, res) => {
    res.sendFile(
      path.join(__dirname, "dist", "countries", ":id", "index.html")
    );
  });
} else {
  // development env
  app.use(express.static(path.join(__dirname, "public")));
}

// update to match the domain you will make the request from
app.use(
  cors({
    // origin: process.env.FRONT_END_HOST,
    origin: [
      "http://localhost:8000", // Local development
      "https://solaroffset-frontend.netlify.app", // Deployed frontend
    ],
    credentials: true,
    optionSuccessStatus: 200,
  })
);

app.use("/", indexRouter);
app.use("/user", userRoutes);
app.use("/", carbonRouter);
app.use("/payments", paymentsRouter);
app.use("/", countryRouter);

// catch 404 and forward to ersror handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

console.log("Listening on", process.env.PORT);

module.exports = app;
