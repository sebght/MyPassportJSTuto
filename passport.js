const passport    = require('passport');
const passportJWT = require("passport-jwt");

const ExtractJWT = passportJWT.ExtractJwt;

const LocalStrategy = require('passport-local').Strategy;
const JWTStrategy   = passportJWT.Strategy;

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

const user = {email:'test',password: 'p'}

passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    },
    function (email, password, cb) {
      console.log(email, password);

        // cette fonction vérifie la validité des identifiants.
        if (email!=user.email || password!=user.password){
            console.log("On a un problème chef ! (login incorrect)")
            return cb(null, false, {message: 'Incorrect email or password.'});
        }
        console.log("Le login est réussi, c'est beau")
        return cb(null, user, {
            message: 'Logged In Successfully'
        })
    }
));

// passport.use(new JWTStrategy({
//         jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
//         secretOrKey   : 'your_jwt_secret'
//     },
//     function (jwtPayload, cb) {
//
//         //find the user in db if needed
//         return UserModel.findOneById(jwtPayload.id)
//             .then(user => {
//                 return cb(null, user);
//             })
//             .catch(err => {
//                 return cb(err);
//             });
//     }
// ));
