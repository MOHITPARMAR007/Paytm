const express = require('express');
const zod = require('zod');
const User = require('../db')
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");
const authMiddleware = require('../middleware');
const router =  express.Router();

 const signupbody= zod.object({
    username: zod.string().min(4).max(20),
    firstName : zod.string().min(1).max(20),
    lastname : zod.string().min(1).max(20),
    passwoard : zod.string().min(6).max(100),
 })


 // sign UP Logic for User 
 router.post("/signup", async (req, res) => {
    const { success } = signupbody.safeParse(req.body)
    if (!success) 
    {
        return res.status(411).json({
            mes : "emial is alreay taken or wrong inputs"
        })
    }
    const exsitingUser = await User.findOne({
        username : req.body.username
    })
    if(exsitingUser) 
    {
        return res.status(411).json({
            mes : "emial is alreay taken or wrong inputs"
        })
    }

    const user =  await User.create({
        username: req.body.username,
        fullname : req.body.fullname,
        lastname: req.body.lastname,
        passwoard : req.body.passwoard
    })
    const userID = user._id; // user id for jwt token 

    	/// ----- Create new account ------

        await Account.create({
            userID,
            balance: 1 + Math.random() * 10000
        })
    
            /// -----  ------

    const token  = jwt.sign({userID},JWT_SECRET);
    res.json({
        message: "User created successfully",
        token: token
    })
 })

 // sing in logic

 const signinBody = zod.object({
    username : zod.string().email(),
    passwoard:zod.string()
 })
 router.post("/signin", async (req, res) => {
    const { success } = signinBody.safeParse(req.body)
    if (!success) {
        return res.status(411).json({
            message: "Incorrect inputs"
        })
    }
    const user =  await User.findOne({
        username: req.body.username,
        password: req.body.password
    })
    if(user)
    {
        const token = jwt.sign({
         userID:user._id,
        },JWT_SECRET)

        res.send.json({
            token : token 
        })
        return ;
    }
    res.status(411).json({
        message: "Error while logging in"
    })
})

const updateBody =  zod.object({
    password: zod.string().optional(),
    firstName: zod.string().optional(),
    lastName: zod.string().optional(),
})

router.put("/",authMiddleware ,async (req,res)=>{
    const {success} = updateBody.safeParse(req.body)
    if(!success) return res.status(411).json({mes : " someting went wrong"}) ;
        
    await User.updateOne(req.body,{
        _id : req.userID
         })

    res.json({
                message: "Updated successfully"
            })

})

router.get("/bulk", async (req, res) => {
    const filter = req.query.filter || "";

    const users = await User.find({
        $or: [{
            firstName: {
                "$regex": filter
            }
        }, {
            lastName: {
                "$regex": filter
            }
        }]
    })

    res.json({
        user: users.map(user => ({
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            _id: user._id
        }))
    })
})
 module.exports = router;
  