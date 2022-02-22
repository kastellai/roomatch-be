const express = require("express");
const router = express.Router();

const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");

const Room = require("../models/room");
const User = require("../models/users");
const {
  addRoomToUser,
  updateRoomPreview,
  usersInterestedInRoom,
  checkMatch,
  getUserData,
  resetUser,
  removeRoomToUser,
  resetRoomPreview,
} = require("../routes/mixutils");

router.get("/rooms", async (req, res) => {
  const query = req.query;
  Room.find(query)
    .then(docs => {
      res.status(200).json(docs);
    })
    .catch(error => {
      res.status(500).json({
        message: error,
      });
    });
});

router.post("/rooms", async (req, res) => {
  const room = new Room({
    _id: new mongoose.Types.ObjectId(),
    roomOwner: ObjectId(req.body.roomOwner),
    roomType: req.body.roomType,
    roomAddress: req.body.roomAddress,
    rentPrice: req.body.rentPrice,
    city: req.body.city,
    town: req.body.town,
    roomPhotos: req.body.roomPhotos,
    roommates: {
      females: req.body.roommates.females,
      males: req.body.roommates.males,
      others: req.body.roommates.others,
    },
    aboutFlat: {
      bedrooms: req.body.aboutFlat.bedrooms,
      bathrooms: req.body.aboutFlat.bathrooms,
      kitchen: req.body.aboutFlat.kitchen,
      airCond: req.body.aboutFlat.airCond,
      billsIncl: req.body.aboutFlat.billsIncl,
      wifi: req.body.aboutFlat.wifi,
    },
    friendlyWith: {
      lgbtq: req.body.friendlyWith.lgbtq,
      multicultural: req.body.friendlyWith.multicultural,
      pet_owner: req.body.friendlyWith.pet_owner,
      veg: req.body.friendlyWith.veg,
      party_lover: req.body.friendlyWith.party_lover,
      smooker: req.body.friendlyWith.smooker,
    },
    // ilike: [mongoose.Schema.Types.ObjectId],
    // wholikesme: [mongoose.Schema.Types.ObjectId],
  });

  room
    .save()
    .then(async result => {
      await addRoomToUser(req.body.roomOwner, updateRoomPreview(result));
      // RIMUOVI LIKES DA WHOLIKESME
      await resetUser(req.body.roomOwner);
      await User.findById({ _id: req.body.roomOwner }).then(async userUpdated =>
        res.status(200).json(await getUserData(userUpdated))
      );
      // res.status(201).json({
      //   message: "record successfully created",
      //   createdUser: result,
      // });
    })
    .catch(error => {
      res.status(500).json({
        error: error,
      });
    });
});

router.get("/rooms/:id", async (req, res) => {
  const roomId = req.params["id"];

  Room.findById({ _id: roomId })
    .then(result => {
      res.status(200).json(result);
    })
    .catch(error => {
      res.status(500).json({
        message: error,
      });
    });
});

router.patch("/rooms/:id", async (req, res) => {
  const roomId = req.params["id"];

  const updateOps = {};
  for (const ops of req.body) {
    updateOps[ops.propName] = ops.value;
  }
  // {"propName": "name", "value": "new_value"}

  Room.updateOne({ _id: roomId }, { $set: updateOps })
    .then(_ => {
      // update room preview in user record
      Room.findById({ _id: roomId }).then(async result => {
        await addRoomToUser(result.roomOwner, updateRoomPreview(result));
        await User.findById({ _id: roomOwner }).then(async userUpdated =>
          res.status(200).json(await getUserData(userUpdated))
        );
      });
    })
    .catch(error => {
      res.status(500).json({
        message: error,
      });
    });
});

router.delete("/rooms/:id", async (req, res) => {
  const roomId = req.params["id"];

  Room.findById({ _id: roomId }).then(async result => {
    await User.updateOne(
      { _id: result.roomOwner },
      { $set: { roomId: resetRoomPreview() } }
    );
    await User.updateOne(
      { _id: result.roomOwner },
      {
        $set: {
          ilike: [],
          matches: [],
          wholikesme: [],
          newLike: [],
          newMatch: [],
          messages: {},
        },
        // $set: { matches: [] },
        // $set: { wholikesme: [] },
        // $set: { newLike: [] },
        // $set: { newMatch: [] },
        // $set: { messages: {} },
      }
    );

    //  await resetUser(result.roomOwner)
    await Room.deleteOne({ _id: roomId })
      .then(async data => {
        await User.findById({ _id: result.roomOwner }).then(async userUpdated =>
          res.status(200).json(await getUserData(userUpdated))
        );
      })
      .catch(error => res.status(500).json({ message: error }));
  });
});

/**
 * Add the like to the current room:
 * - add the current userId to room.wholikesme
 * - add the roomId to user.ilike
 */
router.patch("/rooms/:id/addlike", async (req, res) => {
  const roomId = req.params["id"];

  await Room.findById({ _id: roomId })
    .then(async result => {
      let wholikesme = result.wholikesme;
      wholikesme.push(req.body.userId);

      await User.findById({ _id: result.roomOwner }).then(async result => {
        let newNewLike = result.newLike;
        newNewLike.push(req.body.userId);

        await User.updateOne(
          { _id: result._id },
          { $set: { newLike: newNewLike } }
        );
      });

      await Room.updateOne(
        { _id: roomId },
        { $set: { wholikesme: wholikesme } }
      );

      await User.findById({ _id: req.body.userId }).then(async result => {
        let ilike = result.ilike;
        ilike.push(roomId);

        await User.updateOne(
          { _id: req.body.userId },
          { $set: { ilike: ilike } }
        );
      });

      await Room.findById({ _id: roomId }).then(result => {
        addRoomToUser(result.roomOwner, updateRoomPreview(result));
      });
      await checkMatch(req.body.userId, roomId);
      await User.findById({ _id: req.body.userId }).then(async userUpdated =>
        res.status(200).json(await getUserData(userUpdated))
      );
    })

    .catch(error => {
      res.status(500).json({
        message: error,
      });
    });
});

/**
 * Removes the like from current room:
 * - remove the current userId from room.wholikesme
 * - remove the roomId from user.ilike
 */
router.patch("/rooms/:id/removelike", async (req, res) => {
  const roomId = req.params["id"];

  Room.findById({ _id: roomId })
    .then(async result => {
      let wholikesme = result.wholikesme.filter(id => id !== req.body.userId);

      await User.findById({ _id: result.roomOwner }).then(async result => {
        let newNewLike = result.newLike.filter(id => id !== req.body.userId);

        await User.updateOne(
          { _id: result._id },
          { $set: { newLike: newNewLike } }
        );
      });

      await Room.updateOne(
        { _id: roomId },
        { $set: { wholikesme: wholikesme } }
      );

      await User.findById({ _id: req.body.userId }).then(async result => {
        let ilike = result.ilike.filter(id => id !== roomId);

        await User.updateOne(
          { _id: req.body.userId },
          { $set: { ilike: ilike } }
        );
      });

      await Room.findById({ _id: roomId }).then(result => {
        addRoomToUser(result.roomOwner, updateRoomPreview(result));
      });

      await User.findById({ _id: req.body.userId }).then(async userUpdated =>
        res.status(200).json(await getUserData(userUpdated))
      );
    })
    .catch(error => {
      res.status(500).json({
        message: error,
      });
    });
});

/**
 * Returns the list of users who have added the like the specific room
 * Same result of "/users/:id/wholikesmyroom"
 * TODO - evaluate it
 */
router.get("/rooms/:id/getlikes", async (req, res) => {
  const roomId = req.params["id"];

  Room.findById({ _id: roomId })
    .then(result => {
      User.find()
        .where({ _id: { $in: result.wholikesme } })
        .then(users => {
          const usersList = [];
          users.forEach(user => usersList.push(usersInterestedInRoom(user)));
          res.status(200).json(usersList);
        });
    })
    .catch(error => {
      res.status(500).json({
        message: error,
      });
    });
});

////////// GET ROOMS WITH COMPATIBILITY
router.post("/getrooms", async (req, res) => {
  Room.find({})
    .lean()
    .then(docs => {
      let newDocs = docs.map(item => {
        let compatibility = 0;
        let percent = 0;
        Object.keys(req.body).forEach(par => {
          parseInt(item.friendlyWith[par]) === parseInt(req.body[par]) &&
            compatibility++;
          percent++;
        });
        return {
          ...item,
          compatibility: parseInt((compatibility * 100) / percent),
        };
      });
      res
        .status(200)
        .json(
          newDocs.sort((a, b) => (a.compatibility < b.compatibility ? 1 : -1))
        );
    })
    .catch(error => {
      res.status(500).json({
        message: error,
      });
    });
});

module.exports = router;
