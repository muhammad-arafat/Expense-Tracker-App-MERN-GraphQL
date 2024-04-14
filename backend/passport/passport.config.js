import passport from "passport";
import bcrypt from "bcryptjs";

import User from "../models/user.model.js";
import { GraphQLLocalStrategy } from "graphql-passport";

export const configurePassport = async () => {
  passport.serializeUser((user, done) => {
    console.log("serialize user");
    done(null, user._id);
  });

  passport.deserializeUser(async (id, done) => {
    console.log("deserialize user");

    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  passport.use(
    new GraphQLLocalStrategy(async (username, password, done) => {
      try {
        const user = await User.findOne({ username });
        const validPassword = await bcrypt.compare(password, user.password);
        if (!user) {
          throw new Error("invalid username or password");
        }

        if (!validPassword) {
          throw new Error("invalid username or password");
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );

  passport.use;
};
