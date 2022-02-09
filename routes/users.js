const express = require("express");
const router = express.Router();
const bcrypt = require('bcrypt');

const User = require('../models/users');
const { tokenGenerator } = require('../libs/tokenGenerator');
const mongoose = require('mongoose');

/**
 * Returns all the users
 */
router.get("/users", async ( _ , res) => {
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
    address: req.body.address,
    photo: req.body.photo,
    roomId: req.body.roomId
  })
 
  User.find().where({email: req.body.email})
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
                createdUser: result
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

  User.findById({_id: user_id})
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
  for(const ops of req.body) {
    updateOps[ops.propName] = ops.value;
  }
  // {"propName": "name", "value": "new_value"}
  User.updateOne({_id: userId}, {$set: updateOps})
    .then(result => {
      res.status(200).json(result);
    })
    .catch(error => {
      res.status(500).json({
        message: error
      });
    });
} );


/**
 * Deletes the user specified by id
 */
router.delete("/users/:id", async (req, res) => {
  const user_id = req.params["id"];

  User.deleteOne({_id: user_id})
    .then(result => res.status(200).json(result))
    .catch(error => res.status(500).json({message: error}));
});

/**
 * Saves the generated token for the specific user
 * @param userId - is the id of the user in the Users collection
 * @param token - is the generated token to set for the user
 */
const setTokenUser = async (userId, token) => {
  User.updateOne({_id: userId}, {$set: { token: token }})
  .then(result => console.log("token saved", result))
  .catch(error => new error);
}

/**
 * Logs in the user checking the email and address are correct.
 * If they are correct, set a token to that user.
 */
router.post("/login", async (req, res) => {
  let logged = false;

  User.find().where({email: req.body.email})
    .then(
      async (result) => {
        result.length > 0
          ? logged = await bcrypt.compare(req.body.password, result[0].password)
          : res.status(404).json(
              {
                message: "record not found",
              }
            );
        if(logged) {
          const token = tokenGenerator(32, "#aA");
          await setTokenUser(result[0]._id.toString(), token);
          res.status(200).json(result)
        } else { 
          res.status(400).json({ message : "wrong password"});
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
 * Logs out the user removing the token.
 */
router.post("/logout", async (req, res) => {
  User.find().where({email: req.body.email}, {token: req.body.token })
    .then(
      async (result) => {
        if (result.length) {
          const token = '';
          await setTokenUser(result[0]._id.toString(), token);
          res.status(200).json({ message : "user logged out"})
        } else { 
          res.status(400).json({ message : "error during login"});
        }
      })
    .catch(error => {
        res.status(500).json({
          error: error
        });
      }
    )
});

module.exports = router;
