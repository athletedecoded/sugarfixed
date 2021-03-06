require('dotenv').config();
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');
const {
    PORT,
    SESSION_SECRET
} = process.env;
const db = require('./mongodbConnect');

const bodyParser = require('body-parser');

const app = express();

app.use(express.static(__dirname + '/public/'));
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

// User authentication service
require('./services/userService')(passport);

// EJS template engine
app.set('view engine', 'ejs');
app.use(expressLayouts);

// Middleware
// Express session initialization
app.use(session({
    secret: SESSION_SECRET,
    saveUninitialized: true,
    resave: true
}));

// Socket to show connected user count
const http = require('http').createServer(app);
const io = require('socket.io')(http);
let totalUsers = 0;
io.on('connection', (socket) => {
    totalUsers += 1;
    io.emit('users', totalUsers);
    socket.on('disconnect', () => {
        totalUsers -= 1;
        io.emit('users', totalUsers);
    });
});

// Passport middleware and auth service
app.use(passport.initialize());
app.use(passport.session());

// Express Flash messages
app.use(flash());

// Global variable declaration for Express Flash messages -- used by Materialize toast
app.use(function (req, res, next) {
    res.locals.successMessage = req.flash('success');
    res.locals.errorMessage = req.flash('error');
    res.locals.user = req.user;
    next();
});

// Routes
app.use('/', require('./routes/index.js'));
app.use('/', require('./routes/users.js'));
app.use('/api/vision', require('./routes/vision'));
app.use('/api/sugars', require('./routes/sugars'));

const port = PORT || 8080;

http.listen(port, () => {
    console.log("Listening on port ", port);
});
