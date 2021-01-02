const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const app = express();


/* share ressources with different domains*/
//const cors = require('cors');
app.all('*', function(req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
   // res.setHeader("Access-Control-Allow-Origin", "http://localhost:4200","https://www.sandbox.paypal.com/");
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, content-type, Accept");
    res.setHeader("Access-Control-Allow-Methods","GET,PUT,POST,DELETE");
    next();
});
const bodyParser = require('body-parser')
app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }))


/* ROUTES */
const productsRouter = require('./routes/products');
const ordersRouter = require('./routes/orders');
const usersRouter = require('./routes/users');
const authRouter = require('./routes/auth');
//const checkRouter = require('./routes/check');
//const checkRouter = require('./routes/check');


// uses routes
app.use('/api/products', productsRouter);
app.use('/api/orders' , ordersRouter);
app.use('/api/users', usersRouter);
app.use('/api/auth' , authRouter);
//app.use('/api/check',checkRouter);


/*app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();

});*/
/*app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', "http://localhost:4200");
    res.header('Access-Control-Allow-Methods','GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});
*/
/*app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();
});
*/


/* CORS */
/*var corsOptions = {
    origin: 'http://localhost:4200',
    methods: ['GET', 'PUT', 'DELETE', 'PATCH', 'POST'],
    allowedHeaders: 'Content-Type, Authorization, Origin, X-Requested-With, Accept',
    optionsSuccessStatus: 200 // For legacy browser support
}

app.use(cors(corsOptions));
/*app.use(cors({
    origin: '*',
    methods: ['GET', 'PUT', 'DELETE', 'PATCH', 'POST'],
    allowedHeaders: 'Content-Type, Authorization, Origin, X-Requested-With, Accept',
    preflightContinue: false,
    optionsSuccessStatus: 200
}));*/

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/*app.use('/', indexRouter);
app.use('/users', usersRouter);*/

module.exports = app;
