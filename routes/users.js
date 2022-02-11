const express = require("express");
const router = express.Router();
const bcrypt = require('bcrypt');

const User = require('../models/users');
const Room = require('../models/room');
const { tokenGenerator } = require('../libs/tokenGenerator');
const mongoose = require('mongoose');

/**
 * Returns all the users
 */
router.get("/users", async (_, res) => {
  User.find()
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
    roomId: req.body.roomId
  })

  User.find().where({ email: req.body.email })
    .then((result) => {
      result.length
        ? res.status(200).json({
          message: "email already present in our system"
        })
        : user.save().then(
          result => {
            res.status(201).json(
              {
                message: "record successfully created",
                // createdUser: result
              }
            );
          }).catch(error => {
            res.status(500).json({
              error: error
            });
          }
          )
    })
    .catch(error => {
      res.status(500).json({
        messagge: error
      })
    });

});


/**
 * Reaturns a single user specified by id
 */
router.get("/users/:id", async (req, res) => {
  const user_id = req.params["id"];

  User.findById({ _id: user_id })
    .then(result => {
      res.status(200).json(result);
    })
    .catch(error => {
      res.status(500).json({
        message: error
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
    .then(result => {
      User.findOne().where({ '_id': userId })
          .then(users => res.status(200).json(users))
          .catch(error => {
            res.status(500).json({
              message: error
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
 * Deletes the user specified by id
 */
router.delete("/users/:id", async (req, res) => {
  const user_id = req.params["id"];

  User.deleteOne({ _id: user_id })
    .then(result => res.status(200).json(result))
    .catch(error => res.status(500).json({ message: error }));
});

/**
 * Saves the generated token for the specific user
 * @param userId - is the id of the user in the Users collection
 * @param token - is the generated token to set for the user
 */
const setTokenUser = async (userId, token) => {
  User.updateOne({ _id: userId }, { $set: { token: token } })
    .then(result => result)
    .catch(error => new error);
}

/**
 * Logs in the user checking the email and address are correct.
 * If they are correct, set a token to that user.
 */
router.post("/login", async (req, res) => {
  let logged = false;

  User.findOne().where({email: req.body.email}).select('+password')
    .then(
      async (result) => {
        result 
          ? logged = await bcrypt.compare(req.body.password, result.password)
          : res.status(404).json(
            {
              message: "record not found",
            }
          );
        if (logged) {
          const token = tokenGenerator(32, "#aA");
          await setTokenUser(result._id.toString(), token);
          res.status(200).json(result)
        } else { 
          res.status(400).json({ message : "wrong password"});
        }
      })
    .catch(error => {
      res.status(500).json({
        error: "Error during login"
      });
    })
});

/**
 * Logs out the user removing the token.
 */
router.post("/logout", async (req, res) => {
  User.find().where({ email: req.body.email }, { token: req.body.token })
    .then(
      async (result) => {
        if (result.length) {
          const token = '';
          await setTokenUser(result[0]._id.toString(), token);
          res.status(200).json({ message: "user logged out" })
        } else {
          res.status(400).json({ message: "error during login" });
        }
      })
    .catch(error => {
      res.status(500).json({
        error: error
      });
    }
    )
});

/** 
 * Returns the current user's ads (only 1 ads should be allowed)
 */
router.get("/users/:id/adsroom", async (req, res) => {
  const userId = req.params["id"];
  Room.findOne().where({ roomOwner: userId })
    .then(room => {
      room
        ? res.status(200).json(room)
        : res.status(200).json({ message: "No room present for current user!" })
    })
    .catch(error => {
      res.status(500).json({
        message: error
      });
    });
});

/**
 * Returns the list of people interested to the user's room.
 */
router.get("/users/:id/likesroom", async (req, res) => {
  const userId = req.params["id"];
  Room.findOne().where({ roomOwner: userId })
    .then(room => {
      room
        ? (User.find().where({ '_id': { $in: room.wholikesme } })
          .then(users => res.status(200).json(users))
          // a questo punto, ho la lista di utenti interessati alla mia camera. Per verificare che ci sia gia il match:
          // si controlla l array wholikesme salvato nello storage dell utente ?
          //
          // for userId in users
          //  if  localStorageUtente.wholikesme contains userId -> esiste il match quindi chat ok
          // else -> "Potenziale coinquilino, ti potrebbe interessare?"
          //
        )
        : res.status(200).json({ message: "No user interested in the current ads!" })
    })
    .catch(error => {
      res.status(500).json({
        message: error
      });
    });
});

module.exports = router;
