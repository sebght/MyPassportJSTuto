****************
Authentification
****************
L'authentification sur un serveur Node est relativement facile à implémenter, notamment grâce à l'utilisation des JWT. 

Qu'est-ce ? Sans plus attendre, quelques éléments de réponse.

JSON Web Token (JWT)
====================
*A JSON Web Token (JWT) is a JSON object that is defined in* `RFC 7519 <https://tools.ietf.org/html/rfc7519>`_ *as a safe way to represent a set of information between two parties. The token is composed of a header, a payload, and a signature.* 

Pour faire plus clair, un JWT est un String composé d'un **header**, un **payload** (charge utile) et une **signature**. Ces éléments sont préalablement encodés en *Base64* et hashés, avant d'être séparés par des points. Il sera donc généralement présenté sous la forme suivante :

``header.payload.signature``

Pour faire encore plus clair dans le cas où vous tenez à le faire découvrir à votre petite nièce, je vous conseille `ceci <https://dev.to/hemanth/explain-jwt-like-im-five>`_.

Header
------
.. code-block:: javascript

   {"alg": "HS256","typ": "JWT"}

Payload
-------
.. code-block:: javascript

   {"sub": "1234567890","name": "John Doe","iat": 1516239022}

Signature
---------
.. code-block:: javascript

   HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload), your-256-bit-secret)

où ``HMACSHA256()`` est la fonction de hashage utilisée.

JWT obtenu
---------
.. code-block:: javascript

 eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c

Remarque : Si vous souhaitez vous amuser avec les différentes variables (c'est plutôt relaxant), `le site officiel de JWT <https://jwt.io>`_ vous offrira un *Debugger* très instructif.

Ce token est utilisé par le serveur selon le processus décrit ci-après :

1. L'utilisateur s'authentifie avec la paire id/password, Facebook, Google, etc
2. Le serveur d'authentification vérifie les crédits, connecte l'utilisateur et lui renvoie un JWT qu'il a créé
#. Quand il réalise un *API call*, l'utilisateur fournit au serveur API son JWT
#. Le serveur authentifie le JWT et réalise l'opération souhaitée

**Remarque importante** : contrairement à ce que l'on pourrait croire au premier abord, le format JWT ne garantit aucune sécurité, car il est "encoded" et non "encrypted".

Cas Pratique
============
Codons maintenant !

Le projet nécessite de gérer un client et un serveur, et afin d'en comprendre complètement la logique, nous repartirons de zéro (enfin presque, ne formatez pas votre PC).

Le projet aura donc l'air basique mais se concentrera pleinement sur l'interaction client/serveur.

Préparation du projet
---------------------
Voilà la structure que vous aurez à la fin de ce tutoriel

.. code-block:: sh

  ./
  ├── ./server
  │   ├── ./node_modules/*
  │   ├── ./views/*
  │   ├── ./app.js
  │   ├── ./passport.js
  │   ├── ./package.json
  │   └── ./package-lock.json
  └── ./client

Dans le dossier ``./server`` initialisez npm et installez express et nodemon :

.. code-block:: sh

 authTut $ cd server
 server $ npm init -y
 server $ npm install express --save
 server $ npm install -g nodemon


**Note :** La commande ``npm init -y`` permet d'initialiser **en gardant les paramètres par défaut** (plutôt utile).

`Nodemon <https://nodemon.io/>`_ est un module qui gère automatiquement le *restart* du serveur à chaque modification du code, ce qui nous évitera de le relancer à chaque étape.

Commençons maintenant par créer notre serveur, comme vous savez maintenant le faire.

.. code-block:: javascript

 // modules npm
 const express = require('express');

 // création du serveur
 const app = express();

 // création de l'adressage sur la page d'accueil
 app.get('/', (req, res) => {
     res.send('Bienvenue sur mon site de test\n')
 })

 // indication du port écouté
 app.listen(8080, () => {
     console.log('Listening on localhost:8080')
 })

Vous pouvez maintenant lancer le serveur en utilisant nodemon

.. code-block:: sh

 server $ nodemon server.js

cURL
----
Afin de jouer le rôle du client, vous pouvez soit utiliser les outils de développement de Chrome, soit utiliser le module natif ``cURL`` du terminal :

.. code-block:: sh

 client $ cURL -X GET http://localhost:8080/
 Bienvenue sur mon site de test

Pour avoir plus de détails sur la réponse du serveur :

.. code-block:: sh

 client $ cURL -X GET http://localhost:8080/ -v
 < HTTP/1.1 200 OK
 < X-Powered-By: Express
 < Content-Type: text/html; charset=utf-8
 < Content-Length: 66
 < ETag: W/"1f-Uk+FK+9Mo+kPBiDr0uBpukkQQwI"
 < Date: Sun, 07 Nov 2018 15:20:38 GMT
 < Connection: keep-alive
 Bienvenue sur mon site de test

**Note :** Les amateurs de PowerShell s'orienteront vers `Invoke-WebRequest (iwr) <https://docs.microsoft.com/en-us/powershell/module/microsoft.powershell.utility/invoke-webrequest>`_, que l'on pourra appeler avec l'alias ``Invoke-WebRequest`` ou ``curl`` (logique) :

.. code-block:: sh

 client> curl -Uri http://localhost:8080

 StatusCode        : 200
 StatusDescription : OK
 Content           : Bienvenue sur mon site de test

 RawContent        : HTTP/1.1 200 OK
                    Connection: keep-alive
                    Content-Length: 31
                    Content-Type: text/html; charset=utf-8
                    Date: Wed, 07 Nov 2018 13:48:43 GMT
                    ETag: W/"1f-Uk+FK+9Mo+kPBiDr0uBpukkQQwI"
                    X-Powered-By: Expres...
 Forms             : {}
 Headers           : {[Connection, keep-alive], [Content-Length, 31], [Content-Type,
                    text/html; charset=utf-8], [Date, Wed, 07 Nov 2018 13:48:43 GMT]...}
 Images            : {}
 InputFields       : {}
 Links             : {}
 ParsedHtml        : mshtml.HTMLDocumentClass
 RawContentLength  : 31

Installation des autres dépendances
----
Nous n'aurons besoin que des modules associés à `PassportJS <http://www.passportjs.org/>`_, qui est un middleware d'authentification très simple d'utilisation que nous avons choisi pour ce tutoriel.
Avec celui-ci, vous pouvez gérer l'authentification avec credentials, avec Facebook ou Google, avec OAuth pour mobile, etc. L'implémentation est très rapide, et vous trouverez suffisamment de bonheur pour une journée `sur leur documentation <http://www.passportjs.org/docs/>`_.

Si vous avez oublié ce qu'est un middleware ou êtes arrivés ici sans faire les autres leçons, je vais vous le rappeler : 
 
*"Les fonctions de middleware sont des fonctions qui peuvent accéder à l’objet Request (req), l’objet response (res) et à la fonction middleware suivant dans le cycle demande-réponse de l’application. La fonction middleware suivant est couramment désignée par une variable nommée next."*

Je vous invite également à découvrir `cette jolie explication de la part d'Express <http://expressjs.com/fr/guide/using-middleware.html>`_.

Voici les modules que nous utiliserons ici : ``passport``, ``passport-local``, ``passport-jwt`` et ``jsonwebtoken``.
Il faut donc lancer la commande :

.. code-block:: sh

 server $ npm install --save passport passport-local passport-jwt jsonwebtoken body-parser ejs

Processus de login
------------------
On va d'abord ajouter notre fichier ``passport.js`` dans la même racine que ``app.js``.

.. code-block:: javascript

 //passport.js
 const passport = require('passport');
 const LocalStrategy = require('passport-local').Strategy;

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

Dans le code de ``./app.js``, ajoutez la partie login.

.. code-block:: javascript

 //app.js
 const passport = require('passport');
 ...
 require('./passport');

 const app = express();
 app.set('view engine', 'ejs');
 app.use(passport.initialize());
 ...
 // parse application/json
 app.use(bodyParser.json());
 app.use(bodyParser.urlencoded({ extended: true }));
 ...
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
 module.exports = router;

On doit aussi créer les fichiers ``login.ejs`` et ``home.ejs``.

.. code-block:: html

 // home.ejs
 <html>
 <head>
     <meta charset="utf-8" />
     <title>Maison page</title>
 </head>

 <body>
     <% include partials/navbar.ejs %>

     <h1>Vous êtes bien connecté</h1>
     <p>Bravo à tous, vous avez été incroyables.</p>

     <% include partials/js_import.ejs %>
 </body>
 </html>

.. code-block:: html

 // login.ejs
 <html>
 <head>
     <meta charset="utf-8" />
     <title>Page de login</title>
     <% include partials/head_css_import.ejs %>
 </head>

 <form action="/login" method="post">
     <div>
         <label>Username:</label>
         <input type="text" name="email"/>
     </div>
     <div>
         <label>Password:</label>
         <input type="password" name="password"/>
     </div>
     <div>
         <input type="submit" value="Log In"/>
     </div>
 </form>
 </html>

Voilà, vous pouvez maintenant tester l'adresse `<http://localhost:8080/login>`_ pour essayer d'atteindre la page ``home.ejs`` en retrouvant les credentials dans le code.

**Note finale:** Bon oui, j'ai fourni les credentials "en dur" dans le fichier ``passport.js``, **ce qu'il ne faut pas du tout faire !**
J'ai été au plus simple pour vous faire comprendre rapidement, mais je vous recommande d'ajouter un check sur une base de données contenant les utilisateurs existants.

Comme disait mon père : *faites ce que je dis et pas ce que je fais.*