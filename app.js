// modules npm
const express = require('express');
const passport = require('passport');
require('./passport');

// création du serveur
const app = express();

// gestion de l'authentification
const auth = require('./routes/auth');
const user = require('./routes/user');
app.use('/auth', auth);
app.use('/user', passport.authenticate('jwt', {session: false}), user);

// création de l'adressage sur la page d'accueil
app.get('/', (req, res) => {
    res.send('Bienvenue sur mon site de test\n')
})

// indication du port écouté
app.listen(8080, () => {
    console.log('Listening on localhost:8080')
})