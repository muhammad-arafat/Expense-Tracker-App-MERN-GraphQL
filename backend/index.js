import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import { ApolloServer } from "@apollo/server";

import passport from "passport";
import session from "express-session";
import ConnectMongoDBSession from "connect-mongodb-session";

import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";

import mergedResolvers from "./resolvers/index.js";
import mergedTypeDefs from "./typeDefs/index.js";

import { dbConnection } from "./db/dbConnection.js";
import { buildContext } from "graphql-passport";
import { configurePassport } from "./passport/passport.config.js";

dotenv.config();
configurePassport();

const app = express();
const httpServer = http.createServer(app);

// store setup and session for mongodb user authentication and cookie
const MongoDBStore = ConnectMongoDBSession(session);

const store = new MongoDBStore({
  uri: process.env.MONGO_URI,
  collection: "session",
});

store.on("error", err => console.log(err));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      httpOnly: true,
    },
    store: store,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// apollo server with express middleware
const server = new ApolloServer({
  typeDefs: mergedTypeDefs,
  resolvers: mergedResolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

await server.start();

// context is an object tha is shared via all resolvers
app.use(
  "/",
  cors({
    origin: "http://localhost:3000",
    Credential: true,
  }),
  express.json(),
  expressMiddleware(server, {
    context: async ({ req, res }) => buildContext({ req, res }),
  })
);

// Modified server startup
await new Promise(resolve => httpServer.listen({ port: 4000 }, resolve));

// MongoDB connection
await dbConnection();

console.log(`🚀 Server ready at http://localhost:4000/`);
