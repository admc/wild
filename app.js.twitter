var express = require('express')
  , app = express()
  , http = require('http')
  , server = http.createServer(app)
  , io = require('socket.io').listen(server)
  , routes = require('./routes')
  , path = require('path')
  , passport = require('passport')
  , TwitterStrategy = require('passport-twitter').Strategy
  , twitterCreds = require('./twitter-creds.json');

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('keyboard cat'));
  app.use(express.session({ secret: 'keyboard cat' }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(require('less-middleware')({ src: __dirname + '/public' }));
  app.use(express.static(path.join(__dirname, 'public')));
});

var users = [];

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    var user = users[id];
    done(null, user);
});

passport.use(new TwitterStrategy({
    consumerKey: twitterCreds.consumerKey 
    , consumerSecret: twitterCreds.consumerSecret
    , callbackURL: "http://www.wild.io/auth/twitter/callback"
  },
  function(token, tokenSecret, profile, done) {
    var user = users[profile.id] || 
               (users[profile.id] = { id: profile.id, name: profile.username });
    done(null, user);
  }
));

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/home', ensureAuthenticated, routes.home);

app.get('/auth/twitter', passport.authenticate('twitter'));

app.get('/auth/twitter/callback', 
  passport.authenticate('twitter', { successRedirect: '/home',
                                     failureRedirect: '/' }));


server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

io.sockets.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('thing', function (data) {
    console.log(data);
  });
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/')
}
