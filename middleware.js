const ExpressError = require("./utils/ExpressError.js");
const{listingSchema,reviewSchema} = require("./schema.js");
const Listing = require("./models/listing");
const Review = require("./models/review");

module.exports.isLoggedIn = (req, res, next) => {
    // console.log("is logged in check",req.originalUrl);
    // console.log(req.path, "..", req.originalUrl); 

        if (!req.isAuthenticated()) {
        if (req.method === "GET") {
            req.session.redirectUrl = req.originalUrl;
        }
        req.flash("error", "You must be logged in to do that");
        return res.redirect("/login");
    }
    next();
};

module.exports.saveRedirectUrl = (req,res,next) => {
    console.log("session redirect url before login:", req.session.redirectUrl);
    if(req.session.redirectUrl) {
        res.locals.redirectUrl = (req.session.redirectUrl);
        console.log("saved to locals:",res.locals.redirectUrl);
    }
    next();
};

module.exports.isOwner = async (req,res,next) => {
    try{
    const { id } = req.params;
       const listing = await Listing.findById(id);
      if (!listing) {
       req.flash("error", "Listing not found!");
       return res.redirect("/listings");
       }
         if (!listing.owner.equals(req.user._id)) {
    req.flash("error", "You don't have permission to edit this listing.");
    return res.redirect(`/listings/${id}`);
  }

       next();
}catch (err) {
    console.error("error in is owner:", err);
    req.flash("error","something went wrong");
    return res.redirect("/listings")
}
};

module.exports.validateListing = (req,res,next) => {
    let{error} = listingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
throw new ExpressError(400,errMsg);
} else{
    next();
}
};

module.exports.validateReview = (req,res,next) => {
    let{error} = reviewSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
throw new ExpressError(404,errMsg);
} else{
    next();
}
};

module.exports.isReviewAuthor = async (req,res,next) => {
  const {id, reviewId} = req.params;
  let review = await Review.findById(reviewId);
   if (!review) {
        req.flash("error", "Review not found!");
        return res.redirect(`/listings/${id}`);
    }
    
    if (!review.author.equals(res.locals.currUser._id)) {
        req.flash("error", "you are not the author of this review");
        return res.redirect(`/listings/${id}`);
    } 
    next();

};