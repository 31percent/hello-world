const express = require('express');
const passport = require('passport');
const router = express.Router();

// Twitter OAuth routes
router.get('/twitter', passport.authenticate('twitter'));

router.get('/twitter/callback',
  passport.authenticate('twitter', { failureRedirect: process.env.CLIENT_URL + '/login' }),
  function(req, res) {
    // Successful authentication, redirect to client
    res.redirect(process.env.CLIENT_URL + '/game');
  }
);

// Logout route
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ message: 'Logout successful' });
  });
});

// Check authentication status
router.get('/status', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ 
      authenticated: true, 
      user: {
        id: req.user.id,
        username: req.user.username,
        displayName: req.user.displayName,
        photos: req.user.photos
      }
    });
  } else {
    res.json({ authenticated: false });
  }
});

module.exports = router;