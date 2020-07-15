module.exports = {
  ensureAuth: function (req, res, next) {
    if (req.isAuthenticated()) {
      return next()
    } else {
      res.redirect('/')
    }
  },
  forwardAuthenticated: function(req, res, next) {
  if (!req.isAuthenticated()) {
    return next();
  }
  res.redirect('/dashboard');
  },
  ensureGuest: function (req, res, next) {
    if (req.isAuthenticated()) {
      res.redirect('/dashboard')
    } else {
      return next()
    }
  },
}
