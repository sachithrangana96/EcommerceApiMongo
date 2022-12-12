const {User} = require('../models/user');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

router.get(`/`, async (req,res)=>{
    const userList = await User.find().select('-passwordHash');
    if(!userList){
        res.status(500).json({success:false})
    }
    res.send(userList);
})


router.get(`/:id`, async(req,res)=>{
    const user = await User.findById(req.params.id).select('-passwordHash');

    if(!user){
        res.status(500).json({message:'The user with this id not found!'})
    }
    res.status(200).send(user);
})


router.post(`/`, async (req,res)=>{
    let user = new User({
        name:req.body.name,
        email:req.body.email,
        passwordHash:bcrypt.hashSync(req.body.passwordHash,10),
        phone:req.body.phone,
        isAdmin:req.body.isAdmin,
        apartment:req.body.apartment,
        zip:req.body.zip,
        city:req.body.city,
        country:req.body.country,
    })

    user = await user.save();
    if(!user){
        res.status(500).json({status:false,message:'The User cannot created!'})
    }
    res.send(user)
})


router.post(`/login`,async(req,res)=>{
    let user = await User.findOne({email:req.body.email})
    const secret = process.env.SECRET;
    if(!user){
         res.status(400).send('The user not found');
    }

    if(user&&bcrypt.compareSync(req.body.passwordHash,user.passwordHash)){
        const token = jwt.sign(
            {
             userId:user.id,
             isAdmin:user.isAdmin,
            },
            secret,
            {expiresIn:'1d'}
        )
        res.status(200).json({status:true,user:user.email,token:token})
    }else{
        return res.status(200).json({ mesage: 'Password wrong' });
    }

    // return res.status(200).send(user);
})


router.get(`/get/count`,async (req,res)=>{
    const userCount = await User.countDocuments()

    if(!userCount){
        return res.status(500).json({success:false})
    }
    res.status(400).json({success:true,Count: userCount})
})

router.delete('/:id',(req,res)=>{
    User.findByIdAndRemove(req.params.id).then(user =>{
        if(user){
            return res.status(200).json({success:true,message: 'The User is deleted!'})
        }else{
            return res.status(400).json({success:false,message: 'The User is not Deleted!'})
        }
    }).catch(err=>{
        return res.status(500).json({success:false,error:err})
    })
})

module.exports = router;