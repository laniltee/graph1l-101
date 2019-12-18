var express = require("express");
var graphqlHTTP = require("express-graphql");
var axios = require("axios");
var { buildSchema } = require("graphql");

var baseUrl = "https://jsonplaceholder.typicode.com/users";

// Schema
var schema = buildSchema(`
    type User {
        userId: Int!,
        getAlbums: [Album],
        getTodos(status: Boolean): [Todo],
        getPosts: [Post],
        getAccount: Account,
        getTags: [String],
        addTag(tag: String!): Boolean
    }

    type Account {
        name: String,
        username: String,
        email: String,
    }

    type Album {
        userId: Int,
        id: Int,
        title: String,
    }

    type Todo {
        userId: Int,
        id: Int,
        title: String,
        completed(status: Boolean): Boolean
    }

    type Post {
        userId: Int,
        id: Int,
        title: String,
        body: String
    }

    type Query {
        getUser(userId: Int!): User
    }

    type Mutation {
      setUser(userId: Int!): User 
    }
`);

// Fake Storage
let UserTags = {
  0: [],
  100: []
};

// Classes
class User {
  constructor(userId) {
    this.userId = userId;
    this.tags = [];
  }

  async getAccount() {
    return new Promise((resolve, reject) => {
      axios
        .get(`${baseUrl}/${this.userId}`)
        .then(response => {
          resolve(response.data);
        })
        .catch(error => {
          reject(
            new Error("failed to fetch user details for user " + this.userId)
          );
        });
    });
  }

  async getAlbums() {
    return new Promise((resolve, reject) => {
      axios
        .get(`${baseUrl}/${this.userId}/albums`)
        .then(response => {
          resolve(response.data);
        })
        .catch(error => {
          reject(new Error("failed to fetch albums for user " + this.userId));
          console.error(error);
        });
    });
  }

  async getTodos(filters) {
    return new Promise((resolve, reject) => {
      axios
        .get(`${baseUrl}/${this.userId}/todos`)
        .then(response => {
          let todos = response.data;
          //   reject(new Error("failed to fetch todos for user " + this.userId));
          //   console.error(error);
          if (filters.status) {
            todos = todos.filter(todo => todo.completed === filters.status);
          }
          console.log(filters);
          resolve(todos);
        })
        .catch(error => {
          reject(new Error("failed to fetch todos for user " + this.userId));
          console.error(error);
        });
    });
  }

  async getPosts() {
    return new Promise((resolve, reject) => {
      axios
        .get(`${baseUrl}/${this.userId}/posts`)
        .then(response => {
          resolve(response.data);
        })
        .catch(error => {
          reject(new Error("failed to fetch posts for user " + this.userId));
          console.error(error);
        });
    });
  }

  async getTags() {
    return UserTags[this.userId] || [];
  }

  async addTag(args) {
    if (!UserTags[this.userId]) {
      UserTags[this.userId] = [];
    }
    UserTags[this.userId].push(args.tag);
    return true;
  }
}

// The root provides the top-level API endpoints
var root = {
  getUser: ({ userId }) => {
    return new User(userId);
  },
  setUser: ({ userId }) => {
    return new User(userId);
  }
};

var app = express();

app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true
  })
);

app.listen(4000);

console.log("Running a GraphQL API server at localhost:4000/graphql");
