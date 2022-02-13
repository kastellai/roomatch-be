
const User = require('../models/users')
const Room = require('../models/room');
/**
 * To update the record User with the created room id
 * @param userId - is the id of the user in the Users collection
 * @param roomId - roomId created
 */
exports.addRoomToUser = async (userId, roomId) => {
  await User.updateOne({ _id: userId }, { $set: { roomId: roomId } })
    .then(result => {
      res.status(200).json(result);
    })
    .catch((error) => {
      new Error(error);
    });
}

exports.updateRoomPreview = (updates) => {
  return {
    roomId: updates._id.toString(),
    roomType: updates.roomType,
    city: updates.city,
    town: updates.town,
    roomPhotos: updates.roomPhotos[0],
    friendlyWith: updates.friendlyWith,
    wholikesme: updates.wholikesme,
    ilike: updates.ilike,
    matches: updates.matches,
  };
}

exports.usersInterestedInRoom = (updates) => {
  return {
    iam: updates.iam,
    city: updates.city,
    town: updates.town,
    photo: updates.photo,
    age: updates.age,
    name: updates.name,
    surname: updates.surname,
    gender: updates.gender,
  };
}

exports.previewWhoLikesMe = (updates) => {
  return {
    photo: updates.photo,
    name: updates.name,
    surname: updates.surname,
    city: updates.city,
    town: updates.town,
  }
}

exports.getUserData = (updates, wholikesme) => {
  return {
    name: updates.name,
    surname: updates.surname,
    email: updates.email,
    gender: updates.gender,
    age: updates.age,
    iam: updates.iam,
    city: updates.city,
    town: updates.town,
    photo: updates.photo,
    roomId: updates.roomId,
    wholikesme: wholikesme,
    ilike: updates.ilike
  }
}
