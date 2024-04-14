import { users } from "../dummyData/data.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

const userResolver = {
  Query: {
    authUser: async (_, _, context) => {
      try {
        const user = context.getUser();
        return user;
      } catch (error) {
        console.log("Error in Query of authUser in user resolver: ", error);
        throw new Error(error.message || "Internal Server Error.");
      }
    },
    user: async (_, { userId }) => {
      try {
        const user = await User.findById(userId);
        return user;
      } catch (error) {
        console.log("Error in Query of single user in user resolver: ", error);
        throw new Error(error.message || "Internal Server Error.");
      }
    },
  },
  Mutation: {
    signup: async (_, { input }, context) => {
      try {
        const { username, name, password, gender } = input;

        if (!username || !name || !password || !gender) {
          throw new Error("All fields are required");
        }
        // hashing password
        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(password, salt);

        // random avatar url for users based on username
        // https://avatar-placeholder.iran.liara.run/
        const menDp = `https://avatar.iran.liara.run/public/boy?username=${username}`;
        const womenDp = `https://avatar.iran.liara.run/public/girl?username=${username}`;

        // if user already in User collection
        const existingUser = await User.findOne({ username });
        if (existingUser) {
          throw new Error("User already exist");
        }

        const newUser = new User({
          username,
          name,
          password: hashedPass,
          gender,
          profilePicture: gender === "male" ? menDp : womenDp,
        });
        await newUser.save();
        await context.login(newUser);
        return newUser;
      } catch (error) {
        console.log("Error in signup of user resolver: ", error);
        throw new Error(error.message || "Internal Server Error.");
      }
    },

    login: async (_, { input }, context) => {
      try {
        const { username, password } = input;
        const { user } = await context.authenticate("graphql-local", {
          username,
          password,
        });

        await context.login(user);
        return user;
      } catch (error) {
        console.log("Error in login of user resolver: ", error);
        throw new Error(error.message || "Internal Server Error.");
      }
    },

    logout: async (_, _, context) => {
      try {
        await context.logout();
        req.session.destroy(err => {
          console.error("Error destroying session:", err);
          if (err) throw err;
        });
        res.clearCookie("connect.sid");

        return { message: "Logged out successfully" };
      } catch (error) {
        console.log("Error in logout of user resolver: ", error);
        throw new Error(error.message || "Internal Server Error.");
      }
    },
  },
};

export default userResolver;
