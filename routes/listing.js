const express = require("express");
const router = express.Router();

const {storage} = require("../cloudConfig.js");
const multer  = require('multer')
const upload = multer({ storage }) //files are stored in the uploads folder inside the project itself

const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listing.js");

router.route("/")
  .get(wrapAsync(listingController.index))
  .post(
    isLoggedIn,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.createListing)
  );

//New route
router.get("/new", isLoggedIn, listingController.renderNewFrom);

router.route("/:id")
  .get(wrapAsync(listingController.showListing))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.updateListing)
  )
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

//Index route
// router.get("/", wrapAsync(listingController.index))

//show route
// router.get("/:id", wrapAsync(listingController.showListing))

//Create route
// router.post("/",isLoggedIn,  validateListing, wrapAsync(listingController.createListing))

//Edit route
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditForm)
);

//Update route
// router.put("/:id",isLoggedIn,isOwner, validateListing, wrapAsync(listingController.updateListing))

//delete route
// router.delete("/:id",isLoggedIn,isOwner, wrapAsync(listingController.destroyListing))

module.exports = router;
