// backend/routes/account.js
const express = require('express');
const authMiddleware = require('../middleware');
const { Account } = require('../db');
const {  mongoose } = require('mongoose');

const router = express.Router();


router.get("/balance", authMiddleware, async (req, res) => {
    const account = await Account.findOne({
        userId: req.userId
    });

    res.json({
        balance: account.balance
    })
});

router.post("/transfer" , authMiddleware , async (req,res)=> {
    const  session  = await mongoose.startsession() ;
    session.startTransaction();
    const { amount, to } = req.body ;
    const account = await Account.findOne({userId : req._id}).session(session); 
    if(!account || account.amount < amount) 
    {  
        await session.abortTransaction();
        return res.status(400).json({
            message: "Insufficient balance"
        });
    }

    const toAccount =  await Account.findOne({userId : to}).session(session);

    if(!toAccount) 
    {
        await session.abortTransaction();
        return res.status(400).json({
            message: "Account Not Found :("
        });
    }
    await Account.updateOne({userId : req._id},{$inc : {balance : -amount}}).session(session);
    await Account.updateOne({userId : to},{$inc : { balance :+amount}}).session(session);
    await session.commitTransactoin();

    res.json({
        msg : " transaction Complete" 
    })

})
module.exports = router;