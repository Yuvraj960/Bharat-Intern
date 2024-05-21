const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

// Connecting to the MongoDB database
mongoose.connect('mongodb://localhost:27017/transact', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', () => console.log("Error in connecting to the Database"));
db.once('open', () => console.log("Connected to Database"));

// Define a schema for transactions
const transactionSchema = new mongoose.Schema({
    category: { type: String, required: true },
    amount: { type: Number, required: true },
    note: { type: String, required: true },
    date: { type: String, required: true }
});

// Create a model for transactions
const Transaction = mongoose.model('Transaction', transactionSchema);

// Handle the form submission to add a new transaction
app.post("/add", async (req, res) => {
    const { category_select, amount_input, info, date_input } = req.body;

    const amount = parseFloat(amount_input);

    if (isNaN(amount)) {
        return res.status(400).send("Invalid amount");
    }

    const newTransaction = new Transaction({
        category: category_select,
        amount: amount,
        note: info,
        date: date_input
    });

    try {
        await newTransaction.save();
        console.log("Record Inserted Successfully");
        res.status(200).send("Record Inserted Successfully");
    } catch (err) {
        console.error("Error in saving the record", err);
        res.status(500).send("Error in saving the record");
    }
});

// Fetch all transactions from the database
app.get("/transactions", async (req, res) => {
    try {
        const transactions = await Transaction.find({});
        res.status(200).json(transactions);
    } catch (err) {
        console.error("Error in fetching records", err);
        res.status(500).send("Error in fetching records");
    }
});

// Serve the index.html file
app.get("/", (req, res) => {
    res.set({
        "Allow-access-Allow-Origin": '*'
    });
    return res.redirect('index.html');
});

app.listen(5000, () => {
    console.log("Listening on port 5000");
});
