const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const BodyParser = require('body-parser');
const { Db } = require('mongodb');
const path = require("path");
const app = express();
const cookieParser=require('cookie-parser');
app.use(cookieParser());

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(BodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: "okokokok",
    saveUninitialized: false,
    resave: false,
    cookie: {   
        maxAge: 60000 * 60 * 24
    }
}));

mongoose.connect('mongodb://127.0.0.1:27017/credentials', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("MongoDB connected!"))
  .catch((err) => console.log("MongoDB connection error!"));

const details = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: String,
    name: String,
    phoneno: Number,
    EmailAddress: String
});

const Details = mongoose.model('Details', details);

const banking = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    budget: { type: Number, required: true },
    expense: { type: Number, required: true  },
    balance: { type: Number, required: true },
    Food: { type: Number },
    Rent: { type: Number },
    Transport: { type: Number },
    Entertainment: { type: Number },
    Others: { type: Number }
});

const Banking = mongoose.model('Banking', banking);

const transaction = new mongoose.Schema({
    username: String,
    item: String,
    category: String,
    cost: String,
    Date: String
});

const Transaction = mongoose.model('Transaction', transaction);

app.get("/", async (req, res) => {
    res.sendFile(__dirname + "/views/home.html");
});

app.get("/get-balance", async (req, res) => {
    if (!req.session || !req.session.user) {
        return res.status(401).json({ message: "Unauthorized. User not logged in." });
    }
    try {
        const result = await Banking.findOne({ username: req.session.user });
        if (result && result.balance !== undefined) {
            return res.json({ balance: result.balance });
        } else {
            return res.status(404).json({ message: "Balance not found." });
        }
    } catch (error) {
        console.error("Error fetching balance:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
});

app.get("/home", (req, res) => {
    if (!req.session.user) {
        return res.redirect("/login");
    }
    res.sendFile(__dirname + "/views/dashboard.html");
});

app.post("/setbudget", async (req, res) => {
    const budg = req.body.budget;
    const uname = req.session.user;
    if (uname) {
        const num = 0;
        const response = await Banking.findOne({ username: uname });
        if (response) {
            await Banking.updateOne({ username: uname }, { $inc: { budget: budg, balance: budg } });
        } else {
            await Banking.insertOne({ username: uname, expense: num, budget: budg, balance: budg });
        }
    } else {
        res.json({ message: "Error" });
    }
});

app.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/");
});

app.get("/addtransaction", (req, res) => {
    res.sendFile(__dirname + "/views/addtransaction.html");
});

app.get("/signup", (req, res) => {
    res.sendFile(__dirname + "/views/signup.html");
});

app.get("/login", (req, res) => {
    res.sendFile(__dirname + "/views/login.html");
});

app.get("/features", (req, res) => {
    res.sendFile(__dirname + "/views/features.html");
});

app.get("/aboutus", (req, res) => {
    res.sendFile(__dirname + "/views/aboutUs.html");
});

app.get("/pricing", (req, res) => {
    res.sendFile(__dirname + "/views/price.html");
});

app.post("/loggedin", async (req, res) => {
    const { username, password } = req.body;

    try {
        const existingUser = await Details.findOne({ username });

        if (existingUser) {
            req.session.user = existingUser.username;

            res.cookie("welcomeMessage", `Welcome back, ${existingUser.name}!`, {
                maxAge: 24 * 60 * 60 * 1000,
                httpOnly: false
            });

            return res.redirect("/home");
        } else {
            return res.redirect("/signup");
        }
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).send("Server error");
    }
});

app.post("/submit", async (req, res) => {
    const { username, password, name, phonenumber, email } = req.body;
    const existingUser = await Details.findOne({ username });
    if (existingUser) {
        return res.redirect("/login");
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

app.post("/savetransaction", async (req, res) => {
    const money = parseInt(req.body.cash);
    const itemm = req.body.item;
    const cat = req.body.category;
    const today = new Date();
    const day = String(today.getDate()).padStart(2, "0");
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const year = today.getFullYear();
    const formattedDate = `${day}-${month}-${year}`;
    const user = await Banking.findOne({ username: req.session.user });
    if (user) {
        await Banking.updateOne({ username: req.session.user }, { $inc: { balance: -money, expense: money, [cat]: money } });
        await Transaction.create({
            username: req.session.user,
            item: itemm,
            category: cat,
            cost: money,
            Date: formattedDate
        });
        res.redirect("/home");
    } else {
        res.json({ message: "Budget not set or session not found!" });
    }
});

app.get("/getdetails", async (req, res) => {
    const user = await Banking.find({ username: req.session.user });
    res.json(user);
});

app.get("/alltransactions", (req, res) => {
    res.sendFile(__dirname + "/views/transactions.html");
});

app.get("/getTransactions", async (req, res) => {
    const user = await Transaction.find({ username: req.session.user });
    res.json(user);
});

app.delete('/delete-transaction/:id', async (req, res) => {
    try {
        const transactionId = req.params.id;
        const username = req.session.user;
        if (!username) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        const transaction = await Transaction.findById(transactionId);
        if (!transaction) {
            return res.status(404).json({ success: false, message: "Transaction not found" });
        }
        const { cost, category } = transaction;
        await Transaction.findByIdAndDelete(transactionId);
        const banking = await Banking.findOne({ username });
        const totalExpense = await Transaction.aggregate([
            { $match: { username } },
            { $group: { _id: null, total: { $sum: "$cost" } } }
        ]);
        const newExpense = totalExpense.length ? totalExpense[0].total : 0;
        const updatedCategoryValue = Math.max((banking[category] || 0) - Number(cost), 0);
        const updatedBanking = await Banking.findOneAndUpdate(
            { username },
            {
                $set: {
                    expense: newExpense,
                    balance: banking.balance + Number(cost),
                    [category]: updatedCategoryValue
                }
            },
            { new: true }
        );
        if (!updatedBanking) {
            return res.status(404).json({ success: false, message: 'Banking details not found' });
        }
        res.json({
            success: true,
            message: 'Transaction deleted successfully',
            newBalance: updatedBanking.balance,
            newExpense: updatedBanking.expense
        });
    } catch (error) {
        console.error('Error deleting transaction:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.post("/resetBudget", async (req, res) => {
    await Banking.updateOne(
        { username: req.session.user },
        {
            $set: {
                budget: 0,
                balance: 0,
                expense: 0,
                Food: 0,
                Transport: 0,
                Entertainment: 0,
                Rent: 0,
                Others: 0
            }
        }
    );
});

app.listen(3000, () => {
    console.log("Listening on port 3000..");
});
