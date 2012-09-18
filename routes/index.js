exports.index = function(req, res){
  res.render('index', { user: req.user, title: 'Immersion' });
};

exports.share = function(req, res){
  res.render('share', { user: req.user, postshit: req.body, title: 'Share' });
};

exports.account = function(req, res){
  res.render('account', { user: req.user, title: 'Account'});
};

