const express = require('express');
const mongoose= require('mongoose');
const session=require('express-session');
const BodyParser=require('body-parser');
const { Db } = require('mongodb');
const path=require("path");
const app = express();

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
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
    username: {type:String, unique:true, required: true},
    budget:{type: Number, required: true},
    expense:{type:Number, required: true},
    balance:{type:Number, required: true},
    Food:Number,
    Rent:Number,
    Transport:Number,
    Entertainment:Number,
    Others:Number,
});

const Banking=mongoose.model('Banking',banking);

const transaction= new mongoose.Schema({
    username:String,
    item: String,
    category:String,
    cost: String,
    Date: String,
})

const Transaction=mongoose.model('Transaction',transaction);

app.get("/", async(req,res)=>{
    res.sendFile(__dirname+"/views/home.html");
})



app.get("/home", (req, res) => {
    if (!req.session.user) {
        return res.redirect("/login"); 
    }
    res.sendFile(__dirname + "/views/dashboard.html");
});



app.post("/setbudget",async (req,res)=>{
    const budg=req.body.budget;
    const uname=req.session.user;
    console.log(uname);
    if(uname){
    const num=0;
    const response=await Banking.findOne({username:uname});
    if(response){
        const result=await Banking.updateOne({username:uname},{$inc:{budget:budg,balance:budg}});
    }
    else{
    const result=await Banking.insertOne({username:uname,expense:num,budget:budg,balance:budg});
    }
}
else{
    res.json({message:"Error"});
}
})

app.get("/logout",(req,res)=>{
    req.session.destroy();
    res.send("Logged out succesfully!");    
})

app.get("/addtransaction",(req,res)=>{
    res.sendFile(__dirname+"/views/addtransaction.html");
})

app.get("/signup",(req,res)=>{
    res.sendFile(__dirname+"/views/signup.html");
})

app.get("/login", (req,res)=>{
    res.sendFile(__dirname+"/views/login.html");
})


app.post("/submit", async (req, res) => {
        const { username, password, name, phonenumber, email } = req.body;
        const existingUser = await Details.findOne({ username });
        if (existingUser) {
            req.session.user = existingUser.username;
            return res.redirect("/home");
        }

        const newUser = new Details({
            username,
            password,
            name,
            phoneno: phonenumber,
            EmailAddress: email
        });
        await newUser.save();
        req.session.user = newUser.username;
        res.redirect("/home");       
});
    

app.post("/savetransaction",async (req,res)=>{
    const money=parseInt(req.body.cash);
    const itemm=req.body.item;
    const cat=req.body.category;
    console.log(cat);
    const today = new Date();
    const day = String(today.getDate()).padStart(2, "0");
    const month = String(today.getMonth() + 1).padStart(2, "0"); 
    const year = today.getFullYear();
    const formattedDate = `${day}-${month}-${year}`;
    const user= await Banking.findOne({username:req.session.user});
    if(user){
        const result=await Banking.updateOne({username:req.session.user},{$inc:{balance:-money,expense:money,[cat]:money}});
        const result2 = await Transaction.create({
            username: req.session.user,
            item: itemm,
            category: cat,
            cost: money,
            Date: formattedDate,
        }); 
        res.redirect("/home");
    }
    else{
        res.json({message:"Error!"});
    }
});

app.get("/getdetails", async (req,res) =>{
    const user= await Banking.find({username:req.session.user});
    res.json(user);
}
)

app.get("/alltransactions", (req,res)=>{
    res.sendFile(__dirname+"/views/transactions.html");
})
app.get("/getTransactions", async (req,res)=>{
    const user=await Transaction.find({username:req.session.user});
    res.json(user);
})

app.listen(3000,(req,res)=>{
    console.log("Listening on port 3000..");
});
