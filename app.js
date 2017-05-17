var bodyParser = require('body-parser');
var http = require('http');
var io = require("socket.io");
var express = require('express');
var session = require('express-session');
var mysql = require("mysql");
var bcrypt = require('bcrypt');

const saltRounds = 10;

var sqlConfig = {
    host: "localhost",
    port: 3306,
    database: "2ndhand",
    user: "root",
    password: ""
};

var sessionConfig = {
    key: '2ndhans',
    secret: 'azerty123',
    resave: false,
    saveUninitialized: true
};

var connection = mysql.createConnection(sqlConfig);
connection.connect();

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(__dirname + '/public'));
app.use(session(sessionConfig));

app.set('view engine', 'ejs');
app.set('views', __dirname + "/public");

var server = http.createServer(app);

server.listen(8080, function () {
    console.log('Listening on 8080');
});


//FUNCTIONS ---------------------------------------------------------

function encryptPassword(password){
    console.log("in functie encrypt");
    bcrypt.hash(password, saltRounds, function(err, hash) {
        console.log("encrypted pass: " + hash);
        return hash;
    });
}

function checkEncryptedPassword(userPassword, encryptedPassword){
    bcrypt.compare(userPassword, encryptedPassword, function(err, res) {
        return res;
    });
}


//ROUTING ------------------------------------------------------------

app.get('/account', function (req, res) {
    if (!req.session.user){
        res.sendFile(__dirname + "/public/login.html");
    } else if(req.session.user){
        res.sendFile(__dirname + "/public/account.html");
    }
});

app.get('/home', function (req, res) {
    res.sendFile(__dirname + "/public/index.html");
});

app.get('/sell', function (req, res) {
    res.sendFile(__dirname + "/public/sell.html");
});

app.get('/categories', function (req, res) {
    res.sendFile(__dirname + "/public/categories.html");
});

app.get('/getCategories', function (req, res) {
    var query = 'select * from categories order by Name';
    connection.query(query, function (err, rows) {
        res.json({
            vcategories: rows
        })
    })
});

app.get('/register', function (req, res) {
    res.sendFile(__dirname + "/public/register.html");
});

app.post('/registrate', function (req, res) {
    var username = req.body.username;
    var password = req.body.password;
    var firstname = req.body.firstname;
    var lastname = req.body.lastname;
    var email = req.body.email;

    var encryptedPassword = encryptPassword(password);
    console.log("pass: " + encryptedPassword);

    var user = {username: username, password: encryptedPassword, firstname: firstname, lastname: lastname, email: email};

    var query = "INSERT INTO users SET ?";
    connection.query(query, user, function (err, rows) {
        if (err){
            console.log(err);
            return res.status(500).send();
        }
        return res.sendFile(__dirname + "/public/login.html");
    });

    console.log("pass: " + encryptedPassword);
});

app.post('/login', function(req, res){
    var username = req.body.username;
    var password = req.body.password;

    var query = 'select * from users where username = ?';
    connection.query(query, [username], function (err, rows) {
        var user = rows[0];
        if (err){
            console.log(err);
            return res.status(500).send();
        }

        if (!user){
            return res.status(404).send();
        }
        if (user.username && checkEncryptedPassword(password, user.password)){
            req.session.user = user;
        }
        return res.sendFile(__dirname + "/public/account.html");
    });
});

app.get('/logout', function(req, res){
    req.session.destroy();
    res.sendFile(__dirname + "/public/account.html");
});



app.get('*', function (req, res) {
    res.sendFile(__dirname + "/public/index.html");
});
