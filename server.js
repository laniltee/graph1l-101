const express = require("express");
const graphqlHTTP = require("express-graphql");
const { buildSchema } = require("graphql");
const fetch = require("node-fetch");

// Construct a schema, using GraphQL schema language
const schema = buildSchema(`

  type ToDo {
    userId: Int,
    id: Int,
    title: String,
    completed: Boolean
  }

  type Query {
    hello: String,
    health: Boolean,
    rollDice(numDice: Int!, numSides: Int): [Int],
    quoteOfTheDay: String
    random: Float!
    rollThreeDice: [Int],
    getToDo(userId: Int!): ToDo
  }
`);

class ToDo {
  constructor(userId, id, title, completed) {
    this.userId = userId;
    this.id = id;
    this.title = title;
    this.completed = completed;
  }
}

const getToDoByUserId = async userId => {
  return new Promise((resolve, reject) => {
    fetch("https://jsonplaceholder.typicode.com/todos/" + userId)
      .then(response => response.json())
      .then(json => resolve(json));
  });
};

// The root provides a resolver function for each API endpoint
const root = {
  hello: () => {
    return "Hello world!";
  },
  health: () => {
    return true;
  },
  quoteOfTheDay: () => {
    return Math.random() < 0.5 ? "Take it easy" : "Salvation lies within";
  },
  random: () => {
    return Math.random();
  },
  rollThreeDice: () => {
    return [1, 2, 3].map(_ => 1 + Math.floor(Math.random() * 6));
  },
  rollDice: args => {
    var output = [];
    for (var i = 0; i < args.numDice; i++) {
      output.push(1 + Math.floor(Math.random() * (args.numSides || 6)));
    }
    return output;
  },
  getToDo: async args => {
    const apiResult = await getToDoByUserId(args.userId);
    console.log(apiResult);
    const myTodo = new ToDo(
      apiResult.userId,
      apiResult.id,
      apiResult.title,
      apiResult.completed
    );
    return myTodo;
  }
};

const app = express();

app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true
  })
);

app.listen(4000);

console.log("Running a GraphQL API server at http://localhost:4000/graphql");
