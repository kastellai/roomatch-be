const express = require("express");
const router = express.Router();

const Room = require('../models/room')
const User = require('../models/users')
const mongoose = require('mongoose');

const { ObjectId } = require("mongodb");

router.get("/rooms", async (req, res) => {
  const query = req.query;
  Room.find(query)
    .then(docs => {
      res.status(200).json(docs);
    })
    .catch(error => {
      res.status(500).json({
        message: error
      });
    });
});

/**
 * To update the record User with the created room id
 * @param userId - is the id of the user in the Users collection
 * @param roomId - roomId created
 */
const addRoomToUser = async (userId, roomId) => {
  User.updateOne({ _id: userId }, { $set: { roomId: roomId } })
    .then(result => {
      res.status(200).json(result);
    })
    .catch((error) => {
      new Error(error);
    });
}

router.post("/rooms", async (req, res) => {
  const room = new Room({
    _id: new mongoose.Types.ObjectId(),
    roomOwner: ObjectId(req.body.roomOwner),
    roomType: req.body.roomType,
    roomAddress: req.body.roomAddress,
    city: req.body.city,
    town: req.body.town,
    roomPhotos: req.body.roomPhotos,
    roommates: {
      females: req.body.roommates.females,
      males: req.body.roommates.males,
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
  })

  room.save()
    .then(
      result => {
        addRoomToUser(req.body.roomOwner, result._id.toString());
        res.status(201).json(
          {
            message: "record successfully created",
            createdUser: result
          }
        );
      })
    .catch((error) => {
      res.status(500).json({
        error: error
      });
    }
    )
});


router.get("/rooms/:id", async (req, res) => {
  const roomId = req.params["id"];

  Room.findById({ _id: roomId })
    .then(result => {
      res.status(200).json(result);
    })
    .catch(error => {
      res.status(500).json({
        message: error
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
    .then(result => {
      res.status(200).json(result);
    })
    .catch(error => {
      res.status(500).json({
        message: error
      });
    });
});


router.delete("/rooms/:id", async (req, res) => {
  const roomId = req.params["id"];

  Room.deleteOne({ _id: roomId })
    .then(result => res.status(200).json(result))
    .catch(error => res.status(500).json({ message: error }));
});

/**
 * Add the like to the current room:
 * - add the current userId to room.wholikesme
 * - add the roomId to user.ilike
 */
router.patch("/rooms/:id/addlike", async (req, res) => {
  const roomId = req.params["id"];

  Room.findById({ _id: roomId })
    .then(result => {
      let wholikesme = result.wholikesme;
      wholikesme.push(req.body.userId);

      Room.updateOne({ _id: roomId }, { $set: { wholikesme: wholikesme } })
        .then(_ => {
          User.updateOne({ _id: req.body.userId }, { $set: { ilike: req.body.ilike } })
            .then(_ => {
              User.findById({ _id: req.body.userId }).then(userUpdated => res.status(200).json(userUpdated)
              )
            });
        });
    })
    .catch(error => {
      res.status(500).json({
        message: error
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
    .then(result => {
      let wholikesme = result.wholikesme;
      wholikesme = wholikesme.filter(id => id !== req.body.userId)

      Room.updateOne({ _id: roomId }, { $set: { wholikesme: wholikesme } })
        .then(_ => {
          User.updateOne({ _id: req.body.userId }, { $set: { ilike: req.body.ilike } })
            .then(_ => {
              User.findById({ _id: req.body.userId }).then(userUpdated => res.status(200).json(userUpdated)
              )
            });
        });
    })
    .catch(error => {
      res.status(500).json({
        message: error
      });
    });
});

/**
 * Returns the list of users who have added the like the specific room
 */
router.get("/rooms/:id/getlikes", async (req, res) => {
  const roomId = req.params["id"];

  Room.findById({ _id: roomId })
    .then(result => {
      User.find().where({ '_id': { $in: result.wholikesme } })
        .then(usersList => {
          res.status(200).json(usersList);
        });
    })
    .catch(error => {
      res.status(500).json({
        message: error
      });
    });
});


module.exports = router;