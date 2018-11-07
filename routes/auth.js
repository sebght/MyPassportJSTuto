const express = require('express');
const router  = express.Router();
const jwt = require('jsonwebtoken');
const passport = require('passport');

/!* POST login. *!/
router.post('/login', function (req, res, next) {
    passport.authenticate('local', {successRedirect: '/',failureRedirect: '/login',failureFlash: true,session: false}, (err, user, info) => {
        if (err || !user) {
            return res.status(400).json({
                message: 'On a eu un problème, chef !',
                user   : user
            });
        }
        req.login(user, {session: false}, (err) => {
            if (err) {
                res.send(err);
            }
            // génération d'un web token signé avec les infos de l'objet user
            // renvoi de user et token au serveur
            const token = jwt.sign(user, 'your-256-bit-secret');
            //return res.json({user, token});
            res.redirect('/home')
        });
    })(req, res);
});
module.exports = router;