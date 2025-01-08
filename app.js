if(process.env.NODE_ENV != "production"){
    require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
//path is required for the ejs file
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");

const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
//use for the authentication
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter =require("./routes/listing.js");
const reviewRouter = require("./routes/review.js")
const userRouter = require("./routes/user.js")

// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const DBUrl = process.env.ATLASDB_URL;
main().then(() => {
    console.log("Connected to DB");
})
    .catch((err) => {
        console.log(err);
    })
async function main() {
    await mongoose.connect(DBUrl);
}


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

//mongo session
const store = MongoStore.create({
    mongoUrl: DBUrl,
    crypto:{
        secret:process.env.SECRET,
    },
    touchAfter: 24*3600,

})

store.on("error",()=>{
    console.log("Error in mongo session store ",err);
})

//to establsihed the session between client and web broswer (sessionID) cookie
const sessionOptions = {
    store,
    secret :process.env.SECRET,
    resave :false,
    saveUninitialized: true,
    cookie:{
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true
    }
 
};


// app.get("/", (req, res) => {
//     res.send("Hi!! let's begin");
// })



//flash --> is messages that will appear only one time like user is register after the refresh the page it will disappear  
app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate())); //username and password is local strategy

passport.serializeUser(User.serializeUser()); //to store the user info in the session
passport.deserializeUser(User.deserializeUser()); //deserialize user info the session+

app.use((req,res,next)=>{
    res.locals.success = req.flash("success"); //success key is localy accessible to all the ejs files
    res.locals.error = req.flash("error"); //error key is localy accessible to all the ejs files
    res.locals.currUser = req.user; // the user who logged in
    console.log(res.locals.success);
    next();
})



//by using the express router for listings
app.use("/listings",listingRouter);

//by using the express router for reviews
app.use("/listings/:id/reviews",reviewRouter);

app.use("/",userRouter);







// app.get("/testListing",async (req,res)=>{
//     let sampleListing = new Listing({
//         title:"My New Villa",
//         description:"By the Beach",
//         price:1200,
//         location:"Calangute, Goa",
//         country:"India",
//     });
//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("Successful testing");
// })

//*defining the middleware or handling error

app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page not found"));
})

app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Somethong went wrong" } = err;
    res.status(statusCode).render("error.ejs", { message });
    // res.status(statusCode).send(message);
})

app.listen(8080, () => {
    console.log("server is listening to port 8080");
})

