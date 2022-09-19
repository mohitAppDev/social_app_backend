var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var path = require('path');
var session = require('express-session');
var serverException = require('./utils/serverExceptionHandler')
const compression = require('compression')
var process = require('process');
const connectDB = require('./config/db');
var cors = require('cors');

app.use(cors());
// Connect Database
connectDB();

var port = process.env.PORT || 9091;

app.use(compression({
    level: 6,
    threshold: 10*1000,
    filter: (req, res) => {
    if(req.headers['x-no-compression']) {
       return false
    }
    return compression.filter(req, res);
    },
  }))
  
// app.set('superSecret', config.secret); // secret variable
app.use(session({
    'secret': "secretkey",
    'name': 'sessionId',
    'unset': 'destroy',
    'resave': true,
    'saveUninitialized': true
}));

app.use(cookieParser("secretkey"));
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json({ limit: '5mb' }));

app.use(express.static(path.join(__dirname, '../dist/jhakasi')));

var adminrouter = require('./routes/adminRoutes');
adminrouter(app);

app.use("/uploads/", express.static(__dirname + '/uploads/'));
app.use('/', function(req, res) {
    res.sendFile(path.join(__dirname, '../dist/jhakasi', 'index.html'))
});

const server = app.listen(port, () => console.log(`Server running on port ${port}...`));

const exitHandler = serverException(server, {
    coredump: false,
    timeout: 500
  })
  
  process.on('uncaughtException', exitHandler(1, 'UNCAUGHT EXCEPTION! 💥 Shutting down...'))
  process.on('unhandledRejection', exitHandler(1, 'UNHANDLED REJECTION! 💥 Shutting down...'))
  process.on('SIGINT', exitHandler(0, '👋 SIGINT RECEIVED. Shutting down gracefully'))
  process.on('SIGTERM', exitHandler(0, '👋 SIGTERM RECEIVED. Shutting down gracefully'))

