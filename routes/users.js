const router = require("express").Router();
const User = require("./../models/User");
const bcrypt = require("bcrypt");
const e = require("express");
//update user
router.put("/:id", async (req, res) => {
  // if user id and url param id matches
  if (req.params.id === req.body.userId || req.body.isAdmin) {
    if (req.body.password) {
      try {
        const salt = bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
      } catch (error) {
        return res.status(500).json(error);
      }
    }

    try {
      const user = await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });
      res.status(200).json("succesfully updated");
    } catch (error) {
      res.status(500).json(error);
    }
  } else {
    return res.status(403).json("you can only update your account");
  }
});

//delete user
router.delete("/:id", async (req, res) => {
  

  if (String(req.params.id).includes(req.body.userId) || req.body.isAdmin) {
    try {
      const user = await User.findByIdAndDelete(req.body.userId);
      res.status(200).json("account succesfully deleted !");
    } catch (error) {
      res.status(500).json(error);
    }
  } else {
    res.status(403).json("you can only delete your account");
  }
});

//get a user
router.get("/:id", async (req, res) => {
    try {
        const user = await User.findById(req.body.userId);
        //removal unnecassary objects
        const {password,updatedAt,createdAt, ...other} = user._doc;
        res.status(200).json(other);
    } catch (error) {
        res.status(404).json("user not found");
    }
});
  
//follow a user
router.put("/:id/follow", async(req,res)=>{

    if(!String(req.params.id).includes(req.body.userId)){
        try {

            const user = await User.findById(req.params.id);
            const currrentUser = await User.findById(req.body.userId);
            // check if user followed by current user if not go in
            if(!user.followers.includes(req.body.userId)){
                await user.updateOne({$push:{followers:req.body.userId}});
                await currrentUser.updateOne({$push:{followings:req.params.id}});
                res.status(200).json("user has been followed");
            } else{
                res.status(403).json("you already follow the user")
            }
        } catch (error) {
            res.status(500).json(error);
        }
    } else{
        res.status(403).json("you cant follow yourself")
    }
})

//unfollow a user
router.put("/:id/unfollow", async(req,res)=>{

    if(!String(req.params.id).includes(req.body.userId)){
        try {
            const user = await User.findById(req.params.id);
            const currrentUser = await User.findById(req.body.userId);
            // check if user followed by current user if not go in
            if(user.followers.includes(req.body.userId)){
                await user.updateOne({$pull:{followers:req.body.userId}});
                await currrentUser.updateOne({$pull:{followings:req.params.id}});
                res.status(200).json("user has been unfollowed");
            } else{
                res.status(403).json("you already unfollowed the user")
            }
        } catch (error) {
            res.status(500).json(error);
        }
    } else{
        res.status(403).json("you cant unfollow yourself")
    }
})



module.exports = router;
