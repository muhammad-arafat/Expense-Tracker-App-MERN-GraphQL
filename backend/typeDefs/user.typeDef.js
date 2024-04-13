const userTypeDef = `#graphql
type User{
  _id: ID!
  username:String!
  name:String!
  password:String!
  profilePicture:String
  gender:String!
}

type Query {
  users:[User!]
  authUser:User
  user(userId:ID!):User
}

type Mutation{
  signup(input:signupInput):User
  login(input:loginInput):User
  logout:logoutResponse
}

input signupInput{
  username:String!
  name:String!
  password:String!
  gender:String!
}

input loginInput{
  username:String!
  password:String!
}

type logoutResponse{
  message:String!
}`;

export default userTypeDef;
