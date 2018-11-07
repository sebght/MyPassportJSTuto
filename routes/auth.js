/*const express = require('express');
const router  = express.Router();
const jwt = require('jsonwebtoken');
const passport = require('passport');

/!* POST login. *!/
router.post('/login', function (req, res, next) {
    passport.authenticate('local', {session: false}, (err, user, info) => {
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
            return res.json({user, token});
        });
    })(req, res);
});
module.exports = router;*/
const express = require('express');
const router  = express.Router();

const jwt      = require('jsonwebtoken');
const passport = require('passport');


/* POST login. */
router.post('/login', function (req, res, next) {

    passport.authenticate('local', {session: false}, (err, user, info) => {
        console.log(err);
        if (err || !user) {
            return res.status(400).json({
                message: info ? info.message : 'Login failed',
                user   : user
            });
        }

        req.login(user, {session: false}, (err) => {
            if (err) {
                res.send(err);
            }

            const token = jwt.sign(user,'your_jwt_secret');

            return res.json({user, token});
        });
    })
    (req, res);

});

module.exports = router;