const mongoose = require("mongoose");
const Review = require("./review");
const { required } = require("joi");
const Schema = mongoose.Schema;


const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    image: {
        url: String,
        filename: String,
    },
    price: String,
    location: String,
    country: String,
    category: {
        type: String,
        enum: ["Trending",
            "Amazing Pools",
            "Mountains",
            "Rooms",
            "Farms",
            "Beach",
            "Camping",
            "castels",
            "arctic",
            "dome"
        ],
        required:false
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review",
        },
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
});

listingSchema.post("findOneAndDelete", async (listing) => {
    if (listing) {
        await Review.deleteMany({ reviews: { $in: listing.reviews } });
    }
});
const listing = mongoose.model("Listing", listingSchema);
module.exports = listing;