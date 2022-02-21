const express=require('express')
const mongoose=require('mongoose')
const app=express()
require('dotenv').config()
const userHandler=require('./routes/user')
const Handler=require('./routes/controller')


app.use(express.json())
app.use('/api/userHandler',userHandler)
app.use('/api/Handler',Handler)


//Connection setting
mongoose.connect(process.env.MONGO_URI,{useNewUrlParser:true}).then(()=>{
    console.log('connected')
}).catch(err=>{
    console.log(err)
})

app.listen(process.env.PORT,()=>{
    console.log(`server is running on port ${process.env.PORT}`)
})