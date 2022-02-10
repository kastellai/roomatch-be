const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const roomSchema = new Schema({
  _id: mongoose.Schema.Types.ObjectId,
  roomOwner: mongoose.Schema.Types.ObjectId,
  roomType: { type: String, required: true, enum: ["Private", "Shared"] },
  roomAddress: { type: String, required: true },
  city: { type: String, required: true },
  town: { type: String, required: true },
  roomPhotos: { type: [String], required: true, length: 8 },
  roommates: {
    females: Number,
    males: Number,
  },
  friendlyWith: {
    lgbtq: Number,
    multicultural: Number,
    pet_owner: Number,
    veg: Number,
    party_lover: Number,
    smooker: Number,
  },
  ilike: [String],
  wholikesme: [String],
});

const Room = mongoose.model('Room', roomSchema);
module.exports = Room;