// const bcrypt=require('bcryptjs')
const users=require('../models/Users.js')
const jwt=require('jsonwebtoken')
const bcryptjs = require('bcryptjs')
const router=require('express').Router()
//Register
router.post('/register',async (req,res)=>{
    try {
         //generate new password
         const salt=await bcryptjs.genSalt(10)
         const hashedPassword=await bcryptjs.hash(req.body.password,salt)
         //create user
         const newUser=new users({
             name:req.body.name,
             email:req.body.email,
             password:hashedPassword,
         })
         //save user and send response
         const user=await newUser.save()
        //using jwt
         const {name,id}=user
         const token=jwt.sign({name,id},process.env.SECRET) 
         res.status(200).json({name,id,token})
        } catch (error) {
        res.status(500).json(error)
        }
 
})
//login
router.post('/login',async (req,res)=>{
    try{
       //find user
       const user=await users.findOne({name:req.body.name})
       const {id,name}=user
       !user && res.status(400).json('wrong username or password')
       //validate user
       const valid=await bcrypt.compare(req.body.password,user.password)
       //send response
        if(valid){      
            const token=jwt.sign({id,name},process.env.SECRET)
            res.json({id,name,token})
            }else{
            res.status(400).json('wrong username or password')
            }
    }catch(err){
        res.status(500).json(err)
    }
   })

module.exports=router