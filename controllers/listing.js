const Listing = require("../models/listing.js");

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("./listings/index.ejs", { allListings });
};

module.exports.renderNewFrom = (req, res) => {
  // console.log(req.user);
  //---CAN BE USED AS MIDDLEWARE---
  // if(!req.isAuthenticated()){
  //     req.flash("error","You must be logged in to create listing!");
  //     return res.redirect("/login");
  // }

  res.render("./listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    res.redirect("/listings");
  }
  console.log(listing);
  res.render("./listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
  // let listing = req.body.listing;

  // if(!req.body.listing){
  //     throw new ExpressError(400,"Send valid data for listing");
  // }
  let url = req.file.path;
  let filename = req.file.filename;
  console.log(url, "...", filename);
  const newListing = new Listing(req.body.listing);

  // if(!newListing.title){
  //     throw new ExpressError(400,"Title is missing");
  // }
  // if(!newListing.description){
  //     throw new ExpressError(400,"Description is missing");
  // }
  // if(!newListing.location){
  //     throw new ExpressError(400,"Location is missing");
  // } rather than using if else every we replace it to Joi tool
  newListing.owner = req.user._id;
  newListing.image = { url, filename };
  await newListing.save();
  req.flash("success", "New Listing Created!");
  res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!"); //key --> message
    res.redirect("/listings");
  }
  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_256");
  res.render("./listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
  }

  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};
