exports.index = function(req, res) {
  res.render('index', { user: req.user});
};

exports.developers = function(req, res) {
  res.render('developers', { user: req.user});
};
