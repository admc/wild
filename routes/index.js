exports.index = function(req, res) {
  res.render('index', { user: req.user, title: 'Immersion' });
};

exports.account = function(req, res) {
  res.render('account', { user: req.user, title: 'Account'});
};
