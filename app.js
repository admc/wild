var express = require('express')
  , app = express()
  , http = require('http')
  , server = http.createServer(app)
  , io = require('socket.io').listen(server)
  , routes = require('./routes')
  , path = require('path')
  , passport = require('passport')
  , flash = require('connect-flash')
  , partials = require('express-partials')
  , LocalStrategy = require('passport-local').Strategy
  , couchdb = require('nano')('http://adam:n1njas@nodejitsudb910979441882.iriscouch.com:5984')
  , users = couchdb.use('im_users')
  , media = couchdb.use('im_media');

  app.use(partials());

function findByUsername(username, fn) {
  users.get(username, { revs_info: false}, function(err, body) {
    if (!err) {
      body.username = username;
      return fn(null, body);
    }
    else {
      return fn(null, null);
    }
  });
}

passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  users.get(id, { revs_info: false }, function(err, body) {
    if (!err) {
      body.username = id;
      done(err, body);
    }
  });
});

passport.use(new LocalStrategy(
  function(username, password, done) {
    process.nextTick(function () {
      findByUsername(username, function(err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false, { message: 'Unknown user ' + username }); }
        if (user.password != password) { return done(null, false, { message: 'Invalid password' }); }
        return done(null, user);
      })
    });
  }
));

app.configure(function() {
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('keyboard cat'));
  app.use(express.session({ secret: 'keyboard cat' }));
  app.use(flash());
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(require('less-middleware')({ src: __dirname + '/public' }));
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function() {
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/learn', ensureAuthenticated, function(req, res) {
  res.render('learn', { user: req.user});
});

app.get('/uploads', ensureAuthenticated, function(req, res) {
  var uploads = [];
  for (upload in req.user.media) {
    uploads.push(req.user.media[upload].name);
  }
  res.render('uploads', {user: req.user, uploads: JSON.stringify(uploads) });
});

app.get('/signup', function(req, res) {
  res.render('signup', {user: req.user});
});

app.post('/signup', function(req, res) {
  var bObj = req.body;
  var uObj = {password: bObj.password, email: bObj.email, media: []};

  if (bObj.username && bObj.password && bObj.email) {
    users.insert(uObj, req.body.username, function(err, body) {
      if (!err) {
        res.redirect('/login');
      }
      else {
        res.render('signup', {user: req.user});
      }
    });
  }
});

app.get('/login', function(req, res) {
  res.render('login', { user: req.user, message: req.flash('error') });
});

app.post('/login',
  passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),
  function(req, res) {
    res.redirect('/learn');
  });

app.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

app.get('/share', ensureAuthenticated, function(req, res) {
  res.render('share', { user: req.user, postshit:""});
});

app.post('/share', function(req, res) {
  var vObj = JSON.parse(req.body.transloadit).results.webm_video[0];
  vObj.username = req.user.username;

  //put this in available media
  media.insert(vObj, vObj.id, function(err, body) {
    if (!err) { console.log("inserted new media document"); }
  });

  //Update the users contributed media
  users.get(req.user.username, { revs_info: true}, function(err, body) {
    console.info("got the user");
    console.info(body);
    if (!err) {
      console.info("no error in getting user");
      var uObj = body;
      uObj.media.push(vObj);
      users.insert(uObj, req.user.username, function(err, body) {
        if (!err) { console.info("Updated users media collection"); }
      });
    }
  });
  
  res.render('share', { user: req.user, postshit: "Thanks!"});
});

server.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});

//socket.emit('news', { hello: 'world' });
io.sockets.on('connection', function (socket) {
  media.list(function(err, body) {
    if (!err) {
      body.rows.forEach(function(doc) {
        media.get(doc.id, { revs_info: false}, function(err, body) {
          //emit over websockets
          socket.emit('media', {name:body.name, url:body.url});
        });
      });
    }
  });
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/')
}
