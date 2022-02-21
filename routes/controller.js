const router=require('express').Router()
const req = require('express/lib/request')
const res = require('express/lib/response')
const auth =require('../middlewares/auth')
const Chat = require('../models/Chat')
const chat=require('../models/Chat')
// const User = require('../models/Users')
const user=require('../models/Users')

//For one on one Chats
router.post('/accessChat',auth,async (req,res)=>{
  try {
    const {id:userId}=req.decoded
    const {psId}=req.body

    if(!psId){
        res.status(500).json("userId param not sent with request")
    }

    let  isChat=await chat.find({
        isGroupChat:false,
        $and:[
            {users:{$elemMatch:{$eq:userId}}},
            {users:{$elemMatch:{$eq:psId}}},
        ]
    }).populate('users','-password').populate('latestMessage')

    isChat= await user.populate(isChat,{
        path:'latestMessage.sender',
        select:'name pic email'
    })

    if(isChat.length>0){
        res.send(isChat[0])
    }else{
        var chatData={
            chatName:'sender',
            isGroupChat:false,
            users:[userId,psId]
        }
      
        const createdChat=await chat.create(chatData)
        const fullchat=await chat.findOne(createdChat._id).populate('users','-password')

        res.status(200).json(fullchat)
    }                           
  } catch (error) {
      throw new Error("check userchat enpoint"),
      res.status(500).json({msg:error.message})
  }
})
//fetching all chats which user is involved
router.get('/fetchChat',auth,async (req,res)=>{
    const {id:userId}=req.decoded
    try {
        const fetchChats=await chat.find({users:{$elemMatch:{$eq:userId}}}).populate('users','-password')
        .populate('groupAdmin','-password')
        .populate('latestMessage')
        .sort({updatedAt:-1})
        .then(async (result)=>{
            result= await user.populate(result,{
                path:'latestMessage.sender',
                select:'name pic email'
            })
            res.status(200).json(result)
        })
    } catch (error) {
        res.status(400).json(error.message)
    }
})
//create group chats
router.post('/createGroupChat',auth,async (req,res)=>{
    const {id:userId}=req.decoded
    try {

        if(!req.body.users && !req.body.name){
            res.send('input fields')
        }

        let users=JSON.parse(req.body.users)

        if(users.length < 2){
            res.status(400).send('more than 2 users are required')
        }

        users.push(userId)
        
        const groupChat=await Chat.create({
            chatName:req.body.name,
            isGroupChat:true,
            users:users,
            groupAdmin:userId
        })

        const fullgroup=await chat.findOne({_id:groupChat._id})
        .populate('users','-password')
        .populate('groupAdmin','-password')
        res.send(fullgroup)
    } catch (error) {
        res.status()
    }
})

module.exports=router
