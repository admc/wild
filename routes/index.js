
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Immersion' });
};

exports.home = function(req, res){
  res.render('home', { title: 'Immersion' });
};

