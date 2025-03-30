const express = require('express');
const mongoose= require('mongoose');
const session=require('express-session');
const BodyParser=require('body-parser');
const { Db } = require('mongodb');
const path=require("path");
const app = express();

app.use(express.static(path.join(__dirname, "public")));

app.use(BodyParser.urlencoded({extended :true}));
app.use(express.urlencoded({extended:true}));
app.use(session({
    secret:"okokokok",
    saveUninitialized:false,
    resave:false,
    cookie:{
        maxAge:60000*60*24,
    }
}));

mongoose.connect('mongodb://127.0.0.1:27017/credentials',{
    useNewUrlParser:true,
    useUnifiedTopology:true,
}).then(()=>console.log("MongoDB connected!"))
.catch((err)=>console.log("MongoDB connection error!"));

const details= new mongoose.Schema({
    username:{type:String, required:true, unique: true},
    password:String,
    name:String,
    phoneno:Number,
    EmailAddress:String
})

const Details=mongoose.model('Details',details);

const banking= new mongoose.Schema({
    name: {type:String, required: true},
    budget:{type: Number, required: true},
    expense:{type:Number, required: true},
    balance:{type:Number, required: true}
});

const Banking=mongoose.model('Banking',banking);

app.get("/", async(req,res)=>{
    res.sendFile(__dirname+"/views/home.html");
})

app.get("/dashboard",async (req,res)=>{
    const uname=req.query.name;
    if(req.session.user){
        res.sendFile(__dirname+"/views/dashboard.html");
    }
    else{
        req.session.user=uname;
        res.sendFile(__dirname+"/views/dashboard.html");
    }
})

app.post("/setbudget",async (req,res)=>{
    const budg=req.query.budget;
    const uname=req.session.user;
    if(uname){
    const num=0;
    const result=await Banking.insertOne({name:uname,expense:num,budget:budg,balance:budg});
    if(result){
        res.send("Budget set!");
    }
}
else{
    res.send("Session does not exist");
}
})

app.get("/logout",(req,res)=>{
    req.session.destroy();
    res.send("Logged out succesfully!");    
})

app.get("/signup",(req,res)=>{
    res.sendFile(__dirname+"/views/signup.html");
})

app.get("/login", (req,res)=>{
    res.sendFile(__dirname+"/views/login.html");
})


app.post("/submit",async (req,res)=>{
    const uname=req.body.username;
    const pass=req.body.password;
    const fname=req.body.name;
    const phonenum=req.body.phonenumber;
    const emailadd=req.body.email;
    const existingUser=await Details.findOne({username:uname});
    if(existingUser){
        res.redirect('/login');
    }
    else{
        const newUser=new Details({username:uname,password:pass,name:fname,phoneno:phonenum,EmailAddress:emailadd});
        await newUser.save();
        res.redirect(`/dashboard?name=${fname}`);
    }
});

app.post("/savetransaction",async (req,res)=>{
    const money=parseInt(req.query.cash);
    const user= await Banking.find({name:req.session.user});
    if(user){
        const result=await Banking.updateOne({name:req.session.user},{$inc:{balance:-money,expense:+money}});
        res.send("Db updated!");    
    }
    else{
        res.send("Session not found!");
    }
})

app.get("/getdetails", async (req,res) =>{
    const user= await Banking.find({name:req.session.user});
    res.json(user);
}
)

app.listen(3000,(req,res)=>{
    console.log("Listening on port 3000..");
});
