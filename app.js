if (process.env.NODE_ENV != "production") { 
    require("dotenv").config();
}
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const app = express();
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
// const initData = require("./init");
const engine = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", engine);
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.json());

mongoose
  .connect(process.env.ATLASDB_URL)
  .then(() => {
    console.log(`MongoDb connected`);
  })
  .catch((err) => {
    console.log(err);
  });

const store = MongoStore.create({
  mongoUrl: process.env.ATLASDB_URL,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 60 * 60,
});  

store.on("error", (err) => {
  console.log("Error in Mongo session store", err);
});

const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    maxAge: 1000 * 60 * 60 * 24 * 7,
    httpOnly: true,
  },
};


app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  // console.log(req.flash("success"),"req flash");
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  // we do not use req.user in the ejs template directly so we did for the signup login.
  res.locals.currUser = req.user;
  // console.log(res.locals.success);
  // res.locals.mapboxToken = process.env.MAPBOX_TOKEN;
  next();
});


// app.get('/testListing', async(req, res) => {
//     let sampleListing = new List({
//         title: "LiLa Hotel",
//         description: "Best place to rest",
//         image:"",
//         price: 800,
//         location: "Jodhpur",
//         country: "India"
//     });
//     let listing = await sampleListing.save();
//     console.log(listing);
//     res.send("listed succesfully");
// })

// app.get('/testingdata', async (req, res) => {
//     await List.deleteMany({});
//     const data = await List.insertMany(initData.data, { new: true });

//     console.log(data);
//     res.send("data is saved");
// })

// app.get("/demouser", async (req, res) => {
//     let fakeUser = new User({
//         email: "student@gmail.com",
//         username: "deltaStudent",
//     });
//     const registeredUser = await User.register(fakeUser, "helloworld");
//     res.send(registeredUser);
// });

// for the listing and review routing
app.use("/", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "page not found"));
});

// Handle error middleware
app.use((err, req, res, next) => {
  const { status = 500, message = "Something went wrong!" } = err;
  // res.status(status).send(message);
  res.status(status).render("error.ejs", { status, message, err });
});

app.listen("8080", () => {
  console.log(`server is running at port 8080`);
});

// ejs mate for the layout and partial
