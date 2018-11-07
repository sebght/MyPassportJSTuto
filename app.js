// modules npm
const express = require('express');
var bodyParser = require('body-parser');
const passport = require('passport');
require('./passport');


// création du serveur
const app = express();

// gestion de l'authentification
// const auth = require('./routes/auth');
// const user = require('./routes/user');
//app.use('/auth', auth);
// app.use('/user', passport.authenticate('jwt', {session: false}), user);
// app.use(express.bodyParser());
app.set('view engine', 'ejs');

app.use(passport.initialize());

// parse application/json
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// création de l'adressage sur la page d'accueil
app.get('/', (req, res) => {
    res.send('Bienvenue sur mon site de test\n')
})

// création de l'adressage sur la page de login
app.get('/login', (req, res) => {
    res.render("login")
})
app.post('/login',
    passport.authenticate('local', { successRedirect: '/home',
        failureRedirect: '/login',
        failureFlash: false })
);

// création de l'adressage sur la page une fois connecté
app.get('/home', (req, res) => {
    res.render("home")
})

// indication du port écouté
app.listen(8080, () => {
    console.log('Listening on localhost:8080')
})
