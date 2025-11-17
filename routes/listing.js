const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer  = require('multer')
const {storage} = require("../cloudConfig.js");
const upload = multer({ storage });


router.route("/")
    .get( wrapAsync(listingController.index))
     .post(
        isLoggedIn,
        // validateListing,
        upload.single('listing[image]'),
        wrapAsync(listingController.createListing)
    );

//search route
router.get("/search", wrapAsync (async (req,res) => {
    const query = req.query.q;
    
    if(!query) {
        req.flash("error", "Pleasde enter a search term.");
        return res.redirect("/listings");
    }
    const allListings = await Listing.find({
        $or: [
            {title: {$regex:query, $options: "i"}},
         {location: {$regrex:query, $option:"i"}},
              { country: { $regex: query, $options: "i" } },
        ]
    });
    
  res.render("listings/index", { allListings, query });
}));

//NEW ROUTE
router.get("/new", isLoggedIn, listingController.renderNewForm);

    router.route("/:id")
    .get( wrapAsync(listingController.showListing))
    .put(
    isLoggedIn,
    isOwner,
    upload.single('listing[image]'),
    validateListing,
    wrapAsync(listingController.updateListing)
    )
    .delete(
    isLoggedIn,
    isOwner,
    wrapAsync(listingController.destroyListing));


//Edit Route
router.get("/:id/edit", isLoggedIn, isOwner,
    wrapAsync(listingController.renderEditForm));




module.exports = router;