var createError = require("http-errors");
var express = require("express");
var fileUpload = require("express-fileupload");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var bodyParser = require("body-parser");
var cors = require("cors");
var QRCode = require("qrcode");
const Sentry = require("@sentry/node");

var indexRouter = require("./routes/index");
var authRouter = require("./routes/auth");
var accountsRouter = require("./routes/accounts");
var locationsRouter = require("./routes/locations");
var organizationsRouter = require("./routes/organizations");
var clientsRouter = require("./routes/clients");
var agenciesRouter = require("./routes/agencies");
var rolesRouter = require("./routes/roles");
var venuesRouter = require("./routes/venues");
var briefsRoute = require("./routes/briefs");
var brandsRoute = require("./routes/brands");
var productsRoute = require("./routes/products");
var warehousesRoute = require("./routes/warehouses");
var requisitionsRoute = require("./routes/requisitions");
var eventsRoute = require("./routes/events");
var verificationsRoute = require("./routes/verifications");
var pdfRoute = require("./routes/pdf");
var walletRoute = require("./routes/wallets");
var analyticsRoute = require("./routes/analytics");
var outleteventsRoute = require("./routes/outletevents");
var outletVenuesRoute = require("./routes/outletvenues");
var outletLocationsRoute = require("./routes/outletlocations");
var cartRoute = require("./routes/cart");
var orderInfo = require("./routes/order_info");
var statistics = require("./routes/statistics");
var plansRoute = require("./routes/plans");
var subscriptionsRoute = require("./routes/subscription");
var paymentRoute = require("./routes/payment");
var productCategoryRoute = require("./routes/product_category");
var productTagRoute = require("./routes/product_tags");
var cuisineTypeRoute = require("./routes/cuisine_type");
var SearchRoute = require("./routes/search");

var app = express();
Sentry.init({
  dsn: process.env.SENTRY_DNS,
});

// The request handler must be the first middleware on the app
app.use(Sentry.Handlers.requestHandler());
// Cors
app.use(cors());

// Express file uploader middleware
app.use(
  fileUpload({
    createParentPath: true,
  })
);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use("/", indexRouter);
app.use("/api/auth", authRouter);
app.use("/api/accounts", accountsRouter);
app.use("/api/locations", locationsRouter);
app.use("/api/organizations", organizationsRouter);
app.use("/api/clients", clientsRouter);
app.use("/api/agencies", agenciesRouter);
app.use("/api/roles", rolesRouter);
app.use("/api/venues", venuesRouter);
app.use("/api/briefs", briefsRoute);
app.use("/api/brands", brandsRoute);
app.use("/api/products", productsRoute);
app.use("/api/warehouses", warehousesRoute);
app.use("/api/requisitions", requisitionsRoute);
app.use("/api/events", eventsRoute);
app.use("/api/verifications", verificationsRoute);
app.use("/api/pdf", pdfRoute);
app.use("/api/wallets", walletRoute);
app.use("/api/analytics", analyticsRoute);
app.use("/api/outletevents", outleteventsRoute);
app.use("/api/outletvenues", outletVenuesRoute);
app.use("/api/outletlocations", outletLocationsRoute);
app.use("/api/cart", cartRoute);
app.use("/api/orderinfo", orderInfo);
app.use("/api/statistics", statistics);

//Tomati Routes
app.use("/api/plans", plansRoute);
app.use("/api/subscriptions", subscriptionsRoute);
app.use("/api/payment", paymentRoute);
app.use("/api/productcategories", productCategoryRoute);
app.use("/api/producttags", productTagRoute);
app.use("/api/cuisines", cuisineTypeRoute);
app.use("/api/search", SearchRoute);

// check
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});
app.use(Sentry.Handlers.errorHandler());
// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
