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
  , request = require('request')
  , transloadit = require('node-transloadit')
  , couchdb = require('nano')(process.env.COUCH_DB || 'localhost:5984')
  , users = couchdb.use('im_users')
  , media = couchdb.use('im_media');

  var tlCreds = {"auth_key":process.env.TL_AUTH_KEY || "",
                 "auth_secret": process.env.TL_AUTH_SECRET || ""};
  var tlClient = new transloadit(tlCreds.auth_key, tlCreds.auth_secret);


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
app.get('/developers', routes.developers);
app.get('/learn', ensureAuthenticated, function(req, res) {
  res.render('learn', { user: req.user});
});

app.get('/account', ensureAuthenticated, function(req, res) {
  var uploads = [];
  for (upload in req.user.media) {
    uploads.push(req.user.media[upload]);
  }
  res.render('account', {user: req.user, uploads: JSON.stringify(uploads) });
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
  res.render('share', { user: req.user, id:null});
});

app.post('/share', function(req, res) {
  var vObj = JSON.parse(req.body.transloadit).results.webm_video[0];
  vObj.username = req.user.username;

  //put this in available media
  media.insert(vObj, vObj.id, function(err, body) {
    if (!err) {
      res.render('share', { user: req.user, id: vObj.id});
    }
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
});

server.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});

io.sockets.on('connection', function (socket) {
  socket.on('cut', function(data) {
    var params = {
      template_id: '093261dddb9347d8a090124ade7f9c0c',
      fields: {"ss": data.when - 5, "url": data.url}
    };

    tlClient.send(params, function(info) {
      var pollTL = setInterval(function() {
        request(info.assembly_url, function (error, response, body) {
          if (!error && response.statusCode == 200) {
            var tlObj = JSON.parse(body);
            if (tlObj.results.encode_clip) {
              socket.emit('updateEntry', {url:tlObj.results.encode_clip[0].url, id: data.entry, name:tlObj.results.encode_clip[0].name});
              clearInterval(pollTL);
            }
          }
        })
      }, 2000);
    });
  });

  socket.on('startMedia', function(data) {
    media.list(function(err, body) {
      if (!err) {
        body.rows.forEach(function(doc) {
          media.get(doc.id, { revs_info: false}, function(err, body) {
            //emit over websockets
            socket.emit('media', body);
          });
        });
      }
    });
  });
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/signup')
}
