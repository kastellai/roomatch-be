
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
    _id: updates._id,
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
    ilike: updates.ilike,
    matches: updates.matches,
    messages: updates.messages
  }
}

const updatedUserMatches = async function (userIlike, roomIlike) {
  // console.log(`MATCH! User likes the room `)
  const updatedUserIlike = userIlike.ilike.filter(room => room !== roomIlike._id.toString());
  const updatedUserWholikesme = userIlike.wholikesme.filter(room => room !== roomIlike._id.toString());
  const updatedUserMatches = [...userIlike.matches, roomIlike._id.toString()];

  const updatedRooomIlike = roomIlike.ilike.filter(user => user !== userIlike._id.toString());
  const updatedRooomWholikesme = roomIlike.wholikesme.filter(user => user !== userIlike._id.toString());
  const updatedRooomMatches = [...roomIlike.matches, userIlike._id.toString()];

  await Room.updateOne({ _id: roomIlike._id.toString() }, { $set: { "ilike": updatedRooomIlike, "wholikesme": updatedRooomWholikesme, "matches": updatedRooomMatches } });
  await User.updateOne({ _id: roomIlike.roomOwner }, { $set: { "roomId.ilike": updatedRooomIlike, "roomId.wholikesme": updatedRooomWholikesme, "roomId.matches": updatedRooomMatches } })
  await User.updateOne({ _id: userIlike._id.toString() }, { $set: { "ilike": updatedUserIlike, "wholikesme": updatedUserWholikesme, "matches": updatedUserMatches } })

}


/**
 * Checks if the match user-room exists
 * @param userId - is the id of the user in the Users collection
 * @param roomId - roomId created
 */
exports.checkMatch = async (userId, roomId) => {
  const userIlike = await User.findById({ _id: userId })
    .then(userData => userData)
    .catch((error) => {
      new Error(error);
    });

  const roomIlike = await Room.findById({ _id: roomId })
    .then(roomData => roomData)
    .catch((error) => {
      new Error(error);
    });

  const roomMatched = userIlike.ilike?.length ? userIlike.ilike.filter(room => room === roomId) : [];
  const userMatched = roomIlike.ilike?.length ? roomIlike.ilike.filter(user => user === userId) : [];

  (roomMatched.length > 0 && userMatched.length > 0)
    ? updatedUserMatches(userIlike, roomIlike)
    : console.log("no match yet :( ")
}