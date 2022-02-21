const User = require("../models/users");
const Room = require("../models/room");
/**
 * To update the record User with the created room id
 * @param userId - is the id of the user in the Users collection
 * @param roomId - roomId created
 */
exports.addRoomToUser = async (userId, roomId) => {
  await User.updateOne({ _id: userId }, { $set: { roomId: roomId }})
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((error) => {
      new Error(error);
    });
};

exports.removeRoomToUser = async (userId) => {
  await User.updateOne({ _id: userId }, { $set: { roomId: resetRoomPreview() }})
    .then((result) => {
      console.log(result)
      // res.status(200).json(result);
    })
    .catch((error) => {
      new Error(error);
    });
};

exports.resetUser = async (userId) => {
  await User.updateOne({ _id: userId }, { $set: { ilike: [] }, $set: { matches: [] }, $set: { wholikesme: [] }, $set: { newLike: [] }, $set: { newMatch: [] } })
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((error) => {
      new Error(error);
    });
};


exports.updateRoomPreview = (updates) => {
  return {
    roomId: updates._id.toString(),
    roomType: updates.roomType,
    city: updates.city,
    town: updates.town,
    rentPrice: updates.rentPrice,
    roomAddress: updates.roomAddress,
    roomPhotos: updates.roomPhotos[0],
    friendlyWith: updates.friendlyWith,
    wholikesme: updates.wholikesme,
    ilike: updates.ilike,
    matches: updates.matches,
  };
};

exports.resetRoomPreview = () => {
  return {
    roomId: '',
    roomType: '',
    city: '',
    town: '',
    roomPhotos: '',
  };
};

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
};

exports.previewWhoLikesMe = (updates) => {
  return {
    photo: updates.photo,
    name: updates.name,
    surname: updates.surname,
    city: updates.city,
    town: updates.town,
  };
};

const getUserInfo = async (usersId) => {
  let newUsers = [];
  let promises = [];
  usersId.map(async (single) => {
    promises.push(
      new Promise((resolve, reject) => {
        User.findOne()
          .where({ _id: single })
          .then((result) => {
            resolve(single);
            newUsers = [
              ...newUsers,
              {
                name: result.name,
                surname: result.surname,
                photo: result.photo,
                city: result.city,
                town: result.town,
                id: result.id,
                iam: result.iam,
                room: {
                  roomId: result.roomId.roomId,
                  roomType: result.roomId.roomType,
                  city: result.roomId.city,
                  town: result.roomId.town,
                  roomPhotos: result.roomId.roomPhotos,
                  friendlyWith: result.roomId.friendlyWith,
                },
              },
            ];
          });
      })
    );
  });

  await Promise.all(promises);
  return newUsers;
};

const getRoomInfo = async (roomsId) => {
  let newRooms = [];
  let promises = [];
  roomsId.map(async (single) => {
    promises.push(
      new Promise((resolve, reject) => {
        Room.findOne()
          .where({ _id: single })
          .then((result) => {
            resolve(single);
            newRooms = [
              ...newRooms,
              {
                roomId: result._id,
                roomOwner: result.roomOwner,
                roomType: result.roomType,
                roomPhoto: result.roomPhotos[0],
                roomAddress: result.roomAddress,
                rentPrice: result.rentPrice,
                aboutFlat: result.aboutFlat,
                roommates: result.roommates,
                city: result.city,
                town: result.town,
                friendlyWith: result.friendlyWith,
              },
            ];
          });
      })
    );
  });

  await Promise.all(promises);
  return newRooms;
};

const getMessageInfo = async (messages) => {
  let newMessages = {};
  let promises = [];
  Object.keys(messages).map(async (single) => {
    single !== 'message' &&
    promises.push(
      new Promise((resolve, reject) => {
        User.findOne()
          .where({ _id: single })
          .then((result) => {
            resolve(single);
            newMessages = {
              ...newMessages,
              [single]: {
                discussion: messages[single],
                user: {
                  name: result.name,
                  surname: result.surname,
                  photo: result.photo,
                  id: result.id,
                  room: {
                    roomId: result.roomId.roomId,
                    roomType: result.roomId.roomType,
                    city: result.roomId.city,
                    town: result.roomId.town,
                    roomPhotos: result.roomId.roomPhotos,
                    friendlyWith: result.roomId.friendlyWith,
                  },
                },
              },
            };
          });
      })
    );
  });

  await Promise.all(promises);
  return newMessages;
};

exports.getUserData = async (updates) => {
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
    roomId: {
      ...updates.roomId,
      wholikesme: await getUserInfo(updates.roomId.wholikesme),
      ilike: await getUserInfo(updates.roomId.ilike),
      matches: await getUserInfo(updates.roomId.matches),
    },
    wholikesme: updates.roomId.roomId ? await getUserInfo(updates.wholikesme) : await getRoomInfo(updates.wholikesme),
    ilike: updates.roomId.roomId ? await getUserInfo(updates.ilike) : await getRoomInfo(updates.ilike),
    matches: updates.roomId.roomId ? await getUserInfo(updates.matches) : await getRoomInfo(updates.matches),
    messages: await getMessageInfo(updates.messages),
    token: updates.token,
    newLike: updates.newLike,
    newMatch: updates.newMatch
  };
};

const updatedUserMatches = async function (userIlike, roomIlike) {
  // console.log(`MATCH! User likes the room `)
  const updatedUserIlike = userIlike.ilike.filter(room => room !== roomIlike._id.toString());
  const updatedUserWholikesme = userIlike.wholikesme.filter(room => room !== roomIlike._id.toString());
  const updatedUserMatches = [...userIlike.matches, roomIlike._id.toString()];

  const updatedUserNewMatches = [...userIlike.newMatch, roomIlike._id.toString()];
  const updatedUserNewLike = userIlike.newLike.filter(room => room !== roomIlike._id.toString());

  const updatedRooomIlike = roomIlike.ilike.filter(user => user !== userIlike._id.toString());
  const updatedRooomWholikesme = roomIlike.wholikesme.filter(user => user !== userIlike._id.toString());
  const updatedRooomMatches = [...roomIlike.matches, userIlike._id.toString()];


  await User.findById({ _id: roomIlike.roomOwner })
      .then(async (result) => {
        let newNewMatch = [...result.newMatch, userIlike._id.toString()]
        let newNewLike = result.newLike.filter((id) => id !== userIlike._id.toString());
        await User.updateOne(
          { _id: roomIlike.roomOwner }, { $set: { 
            "roomId.ilike": updatedRooomIlike, 
            "roomId.wholikesme": updatedRooomWholikesme, 
            "roomId.matches": updatedRooomMatches,
            "newLike": newNewLike,
            "newMatch": newNewMatch 
          } })
      })

  await Room.updateOne(
    { _id: roomIlike._id.toString() }, { $set: { 
      "ilike": updatedRooomIlike, 
      "wholikesme": updatedRooomWholikesme, 
      "matches": updatedRooomMatches 
    } });

  // await User.updateOne(
  //   { _id: roomIlike.roomOwner }, { $set: { 
  //     "roomId.ilike": updatedRooomIlike, 
  //     "roomId.wholikesme": updatedRooomWholikesme, 
  //     "roomId.matches": updatedRooomMatches,
  //     "newLike": '',
  //     "newMatch": ''  
  //   } })

  await User.updateOne(
    { _id: userIlike._id.toString() }, { $set: { 
      "ilike": updatedUserIlike, 
      "wholikesme": updatedUserWholikesme, 
      "matches": updatedUserMatches,
      "newLike": updatedUserNewLike,
      "newMatch": updatedUserNewMatches
    } })

}
//   // console.log(`MATCH! User likes the room `)
//   const updatedUserIlike = userIlike.ilike.filter(
//     (room) => room !== roomIlike._id.toString()
//   );
//   const updatedUserWholikesme = userIlike.wholikesme.filter(
//     (room) => room !== roomIlike._id.toString()
//   );
//   const updatedUserMatches = [...userIlike.matches, roomIlike._id.toString()];

  
//   //////
//   const updatedUserNewMatches = [...userIlike.newMatch, roomIlike._id.toString()];

//   const updatedUserNewlike = userIlike.newLike.filter(
//     (room) => room !== roomIlike._id.toString()
//   );

//   console.log(roomIlike)
  
//   const updatedRoomNewlike = roomIlike.newLike.filter(
//     (user) => user !== userIlike._id.toString()
//   );

//   //////

//   let updatedRoomNewMatches;

//   await User.findById({ _id: roomIlike.roomOwner })
//     .then((result) => 
//        updatedRoomNewMatches = [...result.newMatch, userIlike._id.toString()]
//     )
        

//   const updatedRooomIlike = roomIlike.ilike.filter(
//     (user) => user !== userIlike._id.toString()
//   );
//   const updatedRooomWholikesme = roomIlike.wholikesme.filter(
//     (user) => user !== userIlike._id.toString()
//   );
//   const updatedRooomMatches = [...roomIlike.matches, userIlike._id.toString()];

//   await Room.updateOne(
//     { _id: roomIlike._id.toString() },
//     {
//       $set: {
//         ilike: updatedRooomIlike,
//         wholikesme: updatedRooomWholikesme,
//         matches: updatedRooomMatches,
//       },
//     }
//   );
//   await User.updateOne(
//     { _id: roomIlike.roomOwner },
//     {
//       $set: {
//         "roomId.ilike": updatedRooomIlike,
//         "roomId.wholikesme": updatedRooomWholikesme,
//         "newLike": updatedRoomNewlike,
//         "newMatch": updatedRoomNewMatches,
//         "roomId.matches": updatedRooomMatches,
//       },
//     }
//   );
//   await User.updateOne(
//     { _id: userIlike._id.toString() },
//     {
//       $set: {
//         ilike: updatedUserIlike,
//         wholikesme: updatedUserWholikesme,
//         matches: updatedUserMatches,
//         newLike: updatedUserNewlike,
//         newMatch: updatedUserNewMatches
//       },
//     }
//   );
// };

/**
 * Checks if the match user-room exists
 * @param userId - is the id of the user in the Users collection
 * @param roomId - roomId created
 */
exports.checkMatch = async (userId, roomId) => {
  const userIlike = await User.findById({ _id: userId })
    .then((userData) => userData)
    .catch((error) => {
      new Error(error);
    });

  const roomIlike = await Room.findById({ _id: roomId })
    .then((roomData) => roomData)
    .catch((error) => {
      new Error(error);
    });

  const roomMatched = userIlike.ilike?.length
    ? userIlike.ilike.filter((room) => room === roomId)
    : [];
  const userMatched = roomIlike.ilike?.length
    ? roomIlike.ilike.filter((user) => user === userId)
    : [];

  roomMatched.length > 0 && userMatched.length > 0
    ? await updatedUserMatches(userIlike, roomIlike)
    : console.log("no match yet :( ");
};
