const passport = require('passport');
const TwitterStrategy = require('passport-twitter').Strategy;

passport.use(new TwitterStrategy({
    consumerKey: process.env.TWITTER_CONSUMER_KEY,
    consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
    callbackURL: "/auth/twitter/callback"
  },
  function(token, tokenSecret, profile, done) {
    // In a real app, you would save user to database
    const user = {
      id: profile.id,
      username: profile.username,
      displayName: profile.displayName,
      photos: profile.photos,
      token: token,
      tokenSecret: tokenSecret
    };
    
    return done(null, user);
  }
));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});