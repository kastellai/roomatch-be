const express = require("express");
const router = express.Router();

const User = require('../models/users')
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
  const user = new User({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    surname: req.body.surname,
    email: req.body.email,
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
 * WIP
 * To update the record User with the created room
 * @param userId - userId
 * @param roomId - roomId created
 */
const addRoomToUser = async (userId, roomId) => {
  console.log("SONO IN addRoomToUser")
  User.updateOne({_id: userId}, {$set: { roomId: roomId }})
    .then(result => {
      res.status(200).json(result);
      console.log("SAVED IN addRoomToUser")
    })
    .catch(error => {
      console.log("ERROR IN addRoomToUser")
      res.status(500).json({
        message: error
      });
    });
}
exports.addRoomToUser = addRoomToUser ;

/**
 * Deletes the user specified by id
 */
router.delete("/users/:id", async (req, res) => {
  const user_id = req.params["id"];

  User.deleteOne({_id: user_id})
    .then(result => res.status(200).json(result))
    .catch(error => res.status(500).json({message: error}));
});

module.exports = router;
