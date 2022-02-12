const mongoose = require('mongoose');
// https://mongoosejs.com/docs/schematypes.html
// https://stackabuse.com/mongoose-with-nodejs-object-data-modeling/
// //https://heynode.com/blog/2020-04/salt-and-hash-passwords-bcrypt/

const userSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: { type: String, required: true },
  surname: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true, select: false },
  gender: { type: String, required: true, enum: ["Female", "Male", "Other"] },
  age: { type: Number, required: true },
  iam: {
    lgbtq: Number,
    multicultural: Number,
    pet_owner: Number,
    veg: Number,
    party_lover: Number,
    smooker: Number,
  },
  ilike: [String],
  wholikesme: [String],
  city: { type: String, required: true },
  town: { type: String, required: true },
  photo: { type: String, required: true },
  roomId: {
    roomId: String,
    roomType: String,
    city: String,
    town: String,
    roomPhotos: String,
    friendlyWith: {
      lgbtq: Number,
      multicultural: Number,
      pet_owner: Number,
      veg: Number,
      party_lover: Number,
      smooker: Number,
    },
    wholikesme: [String],
    ilike: [String],
  },
  token: { type: String }
});

module.exports = mongoose.model('User', userSchema);