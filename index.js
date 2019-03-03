const express = require('express'),
    bodyParser = require('body-parser'),
    morgan      = require('morgan'),
    jwt    = require('jsonwebtoken'),
    cookieParser = require('cookie-parser');
    config = require('./config'),
    app = express();


// set Secret
app.set('Secret', config.secret);

// to log requests to the console
app.use(morgan('dev'));

app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());
app.use(cookieParser());

app.listen(3000, () => {
    console.log('Server is running is port 3000');
});

app.get('/', function (req, res) {
    res.send('Hello world!');
});

app.post('/authenticate', (req, res) => {
   if (req.body.username === 'omar' && req.body.password === '123') {
       const payload = {
            check: true
       };

       const token = jwt.sign(payload, app.get('Secret'), {
           expiresIn: 1440
       });

        res.cookie('token', token, {expire: new Date() + 1000 }).json({
           message: 'authentication done',
           token: token
       });
   } else {
       res.send({message: 'User or password incorrect'});
   }
});

const protectedRoutes = express.Router();

protectedRoutes.use((req, res, next) => {
    const token = req.cookies.token;

    if (token) {
        jwt.verify(token, app.get('Secret'), (err, decoded) => {
            if (err) return res.json({message: 'invalid token'});

            req.decoded = decoded;
            next();
        });
    } else {
        res.send({message: 'No token provided!'});
    }
});

protectedRoutes.get('/getAllProducts', (req, res) => {
    let products = [{
        id: 1,
        name: 'cheese'
    }, {
        id: 2,
        name: 'jam'
    }];

    res.json(products);

});

app.use('/api', protectedRoutes);

