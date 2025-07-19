const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(
	new GoogleStrategy(
		{
			clientID: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
			callbackURL: process.env.GOOGLE_CALLBACK_URL,
		},
		async (accessToken, refreshToken, profile, done) => {
			try {
				const email = profile.emails[0].value;
				const googleId = profile.id;
				const name = profile.displayName;
				const profilePicture = profile.photos[0]?.value || null;

				let user = await User.findOne({ googleId });

				if (user) {
					return done(null, user);
				}

				user = await User.findOne({ email });

				if (user) {
					user.googleId = googleId;
					if (profilePicture) {
						user.profilePicture = profilePicture;
					}
					await user.save();
					return done(null, user);
				}

				user = new User({
					email,
					googleId,
					name,
					profilePicture,
				});

				await user.save();
				return done(null, user);
			} catch (error) {
				return done(error, null);
			}
		}
	)
);

module.exports = passport;