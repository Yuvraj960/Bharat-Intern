var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");

const app = express();

app.use(bodyParser.json());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({
    extended: true
}));

mongoose.connect('mongodb://localhost:27017/UserSignUps');
var db = mongoose.connection;
db.on('error', () => console.log("Error in Connecting to Database"));
db.once('open', () => console.log("Connected to Database"));

app.post("/sign_up", (req, res) => {
    var name = req.body.name;
    var age = req.body.age;
    var email = req.body.email;
    var phno = req.body.phno;
    var gender = req.body.gender;
    var password = req.body.password;
    var confirmpassword = req.body.confirmpassword;

    if (password !== confirmpassword) {
        return res.status(400).send("Passwords do not match");
    }

    var data = {
        "name": name,
        "age": age,
        "email": email,
        "phno": phno,
        "gender": gender,
        "password": password
    };
    db.collection('users').insertOne(data, (err, collection) => {
        if (err) {
            throw err;
        }
        console.log("Record Inserted Successfully");
        return res.redirect('signup_successful.html');
    });
});

app.post("/login", (req, res) => {
    var email = req.body.email;
    var password = req.body.password;

    db.collection('users').findOne({ email: email, password: password }, (err, user) => {
        if (err) {
            throw err;
        }
        if (user) {
            return res.redirect('main.html');
        } else {
            return res.status(401).send("Invalid email or password");
        }
    });
});

app.get("/", (req, res) => {
    res.set({
        "Allow-access-Allow-Origin": '*'
    });
    return res.redirect('index.html');
}).listen(3000);

console.log("Listening on port 3000");
