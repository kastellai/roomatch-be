const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");

const mongoose = require("mongoose");
const { tokenGenerator } = require("../libs/tokenGenerator");

const User = require("../models/users");
const Room = require("../models/room");
const {
  addRoomToUser,
  updateRoomPreview,
  usersInterestedInRoom,
  previewWhoLikesMe,
  getUserData,
  checkMatch,
} = require("../routes/mixutils");
/**
 * Returns all the users
 */
router.get("/users", async (_, res) => {
  User.find()
    .then((docs) => {
      res.status(200).json(docs);
    })
    .catch((error) => {
      res.status(500).json({
        message: error,
      });
    });
});

/**
 * Creates new user based on the request body
 */
router.post("/users", async (req, res) => {
  const saltRounds = 10; // data processing time
  // salt and hash
  let saltedPassword = await bcrypt.hash(req.body.password, saltRounds);

  const user = new User({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    surname: req.body.surname,
    email: req.body.email,
    password: saltedPassword,
    gender: req.body.gender,
    age: req.body.age,
    iam: {
      lgbtq: req.body.iam.lgbtq,
      multicultural: req.body.iam.multicultural,
      pet_owner: req.body.iam.pet_owner,
      veg: req.body.iam.veg,
      party_lover: req.body.iam.party_lover,
      smooker: req.body.iam.smooker,
    },
    city: req.body.city,
    town: req.body.town,
    photo: req.body.photo,
    roomId: {
      roomId: "",
      roomType: "",
      city: "",
      town: "",
      roomPhotos: "",
      friendlyWith: {
        lgbtq: "",
        multicultural: "",
        pet_owner: "",
        veg: "",
        party_lover: "",
        smooker: "",
      },
      wholikesme: [],
    },
    messages: {}
  });

  User.find()
    .where({ email: req.body.email })
    .then((result) => {
      result.length
        ? res.status(400).json({
            message: "email already present in our system",
          })
        : user
            .save()
            .then((_) => {
              res.status(201).json({
                message: "record successfully created",
                // createdUser: result
              });
            })
            .catch((error) => {
              res.status(500).json({
                error: error,
              });
            });
    })
    .catch((error) => {
      res.status(500).json({
        messagge: error,
      });
    });
});

/**
 * Reaturns a single user specified by id
 */
router.get("/users/:id", async (req, res) => {
  const user_id = req.params["id"];

  User.findById({ _id: user_id })
    .then((result) => {
      User.find()
        .where({ _id: { $in: result.wholikesme } })
        .then((users) => {
          const usersList = [];
          users.forEach((user) => usersList.push(previewWhoLikesMe(user)));
          res.status(200).json(getUserData(result));
        });
    })
    .catch((error) => {
      res.status(500).json({
        message: error,
      });
    });
});

/**
 * Updates the specific user with the new value for the fields in body
 **/
router.patch("/users/:id", async (req, res) => {
  const userId = req.params["id"];

  const updateOps = {};
  for (const ops of req.body) {
    updateOps[ops.propName] = ops.value;
  }
  // {"propName": "name", "value": "new_value"}
  User.updateOne({ _id: userId }, { $set: updateOps })
    .then((_) => {
      User.findOne()
        .where({ _id: userId })
        .then((users) => res.status(200).json(users))
        .catch((error) => {
          res.status(500).json({
            message: error,
          });
        });
    })
    .catch((error) => {
      res.status(500).json({
        message: error,
      });
    });
});

/**
 * Deletes the user specified by id
 */
router.delete("/users/:id", async (req, res) => {
  const user_id = req.params["id"];

  User.deleteOne({ _id: user_id })
    .then((result) => res.status(200).json(result))
    .catch((error) => res.status(500).json({ message: error }));
});

/**
 * Saves the generated token for the specific user
 * @param userId - is the id of the user in the Users collection
 * @param token - is the generated token to set for the user
 */
const setTokenUser = async (userId, token) => {
  User.updateOne({ _id: userId }, { $set: { token: token } })
    .then((result) => result)
    .catch((error) => new error());
};

/**
 * Logs in the user checking the email and address are correct.
 * If they are correct, set a token to that user.
 */
router.post("/login", async (req, res) => {
  let logged = false;

  User.findOne()
    .where({ email: req.body.email })
    .select("+password")
    .then(async (result) => {
      result
        ? (logged = await bcrypt.compare(req.body.password, result.password))
        : res.status(404).json({
            message: "record not found",
          });
      if (logged) {
        const token = tokenGenerator(32, "#aA");
        await setTokenUser(result._id.toString(), token);
        User.find()
          .where({ _id: { $in: result.wholikesme } })
          .then(async (users) => {
            const usersList = [];
            users.forEach((user) => usersList.push(previewWhoLikesMe(user)));
            res.status(200).json(await getUserData(result, usersList));
          });
      } else {
        res.status(400).json({ message: "wrong password" });
      }
    })
    .catch((error) => {
      res.status(500).json({
        error: "Error during login",
      });
    });
});

/**
 * Logs out the user removing the token.
 */
router.post("/logout", async (req, res) => {
  User.find()
    .where({ email: req.body.email }, { token: req.body.token })
    .then(async (result) => {
      if (result.length) {
        const token = "";
        await setTokenUser(result[0]._id.toString(), token);
        res.status(200).json({ message: "user logged out" });
      } else {
        res.status(400).json({ message: "error during login" });
      }
    })
    .catch((error) => {
      res.status(500).json({
        error: error,
      });
    });
});

/**
 * Returns the current user's ads (only 1 ads should be allowed)
 */
router.get("/users/:id/adsroom", async (req, res) => {
  const userId = req.params["id"];
  Room.findOne()
    .where({ roomOwner: userId })
    .then((room) => {
      room
        ? res.status(200).json(room)
        : res
            .status(200)
            .json({ message: "No room present for current user!" });
    })
    .catch((error) => {
      res.status(500).json({
        message: error,
      });
    });
});

/**
 * Returns the list of people interested to the user's room.
 */
router.get("/users/:id/wholikesmyroom", async (req, res) => {
  const userId = req.params["id"];

  Room.findOne()
    .where({ roomOwner: userId })
    .then((room) => {
      room
        ? User.find()
            .where({ _id: { $in: room.wholikesme } })
            .then((users) => {
              const usersList = [];
              users.forEach((user) =>
                usersList.push(usersInterestedInRoom(user))
              );
              res.status(200).json(usersList);
            })
        : // TODO - a questo punto, ho la lista di utenti interessati alla mia camera. Per verificare che ci sia gia il match:
          // si controlla l array wholikesme salvato nello storage dell utente ?
          //
          // for userId in users
          //  if  localStorageUtente.wholikesme contains userId -> esiste il match quindi chat ok
          // else -> "Potenziale coinquilino, ti potrebbe interessare?"
          //
          res
            .status(200)
            .json({ message: "No user interested in the current ads!" });
    })
    .catch((error) => {
      res.status(500).json({
        message: error,
      });
    });
});

/**
 * Adds the like to the current user:
 * - adds the current user roomId to target user.wholikesme
 * - adds the target user._id to my user.ilike
 **/
router.patch("/users/:id/addlike", async (req, res) => {
  const userId = req.params["id"];
 
  await User.findById({ _id: userId })
    .then(async (result) => {
      let wholikesme = result.wholikesme;
      wholikesme.push(req.body.roomId);

      await User.updateOne(
        { _id: userId },
        { $set: { wholikesme: wholikesme } }
      );

      await Room.findById({ _id: req.body.roomId })
      .then(async (result) => {
        let ilike = result.ilike;
        ilike.push(userId)

        await Room.updateOne(
          { _id: req.body.roomId },
          { $set: { ilike: ilike } }
        );
      })


      // update room preview in user record
      await Room.findById({ _id: req.body.roomId }).then((result) => {
        addRoomToUser(result.roomOwner, updateRoomPreview(result));
        User.findById({ _id: result.roomOwner }).then(async (userUpdated) =>
            res.status(200).json(await getUserData(userUpdated))
        );
      });


      // Room.findById({ _id: req.body.roomId }).then(async (result) => {
      //   await addRoomToUser(result.roomOwner, updateRoomPreview(result));

      //   User.findById({ _id: result.roomOwner }).then(async (userUpdated) =>
      //     res.status(200).json(await getUserData(userUpdated))
      //   );
      // });
    })
    .catch((error) => {
      res.status(500).json({
        message: error,
      });
    });
  await checkMatch(userId, req.body.roomId);
});

/**
 * Removes the like to the current user:
 * - removes the current user roomId from taregt user.wholikesme
 * - removes the target user._id from my user.roomId.ilike
 **/
router.patch("/users/:id/removelike", async (req, res) => {
  const userId = req.params["id"];

  User.findById({ _id: userId })
    .then(async (result) => {
      let wholikesme = result.wholikesme.filter((id) => id !== req.body.roomId);

      await User.updateOne(
        { _id: userId },
        { $set: { wholikesme: wholikesme } }
      );

      await Room.findById({ _id: req.body.roomId })
      .then(async (result) => {
        let ilike = result.ilike.filter((id) => id !== userId)
        
        await Room.updateOne(
          { _id: req.body.roomId },
          { $set: { ilike: ilike } }
        );
      })

      // await Room.updateOne(
      //   { _id: req.body.roomId },
      //   { $set: { ilike: req.body.roomilike } }
      // );

      // update room preview in user record
      await Room.findById({ _id: req.body.roomId }).then((result) => {
        addRoomToUser(result.roomOwner, updateRoomPreview(result));
        User.findById({ _id: result.roomOwner }).then(async (userUpdated) =>
            res.status(200).json(await getUserData(userUpdated))
        );
      });
    })
    .catch((error) => {
      res.status(500).json({
        message: error,
      });
    });
});

/// MESSAGES

router.post("/message", async (req, res) => {
  // payload
  // {
  //   myId: '1212312'
  //   friendId: '1232423'
  //   message: {
  //         date: '',
  //         author: '',
  //         text: ''
  //      }
  // }

  await User.findById({ _id: req.body.myId })
    .then(async (result) => {
      await User.updateOne(
        { _id: req.body.myId },
        {$set: {
            messages: {
              ...result.messages,
              [req.body.friendId]: result.messages[req.body.friendId]
                ? [...result.messages[req.body.friendId], req.body.message]
                : [req.body.message]}}});})
    .then(
      User.findById({ _id: req.body.friendId }).then(async (result) => {
        await User.updateOne(
          { _id: req.body.friendId },
          {
            $set: {
              messages: {
                ...result.messages,
                [req.body.myId]: result.messages[req.body.myId]
                  ? [...result.messages[req.body.myId], req.body.message]
                  : [req.body.message],
              },
            },
          }
        );
      })
    ).catch((error) => {
      res.status(500).json({
        message: error
      })
    })


    User.findById({ _id: req.body.myId })
    .then(async (result) => {
      
      res.status(200).json(await getUserData(result));
    })
    .catch((error) => {
      res.status(500).json({
        message: error,
      });
    });
});

module.exports = router;
