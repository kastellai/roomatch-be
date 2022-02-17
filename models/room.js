const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const roomSchema = new Schema({
  _id: mongoose.Schema.Types.ObjectId,
  roomOwner: mongoose.Schema.Types.ObjectId,
  roomType: { type: String, required: true, enum: ["Private", "Shared"] },
  rentPrice: { type: String, required: true},
  roomAddress: { type: String, required: true },
  city: { type: String, required: true },
  town: { type: String, required: true },
  roomPhotos: { type: [String], required: true },
  aboutFlat: {
    bedrooms: String,
    bathrooms: String,
    kitchen: String,
    airCond: Boolean,
    billsIncl: Boolean,
    wifi: Boolean,
  },
  roommates: {
    females: String,
    males: String,
    others: String,
  },
  friendlyWith: {
    lgbtq: String,
    multicultural: String,
    pet_owner: String,
    veg: String,
    party_lover: String,
    smooker: String,
  },
  ilike: [String],
  wholikesme: [String],
  matches: [String],
});

const Room = mongoose.model('Room', roomSchema);
module.exports = Room;