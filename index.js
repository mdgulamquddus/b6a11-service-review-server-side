const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.h6dt8.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).send({ message: "Anauthorized Access" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      res.status(401).send({ message: "Anauthorized Access" });
    }
    req.decoded = decoded;
    next();
  });
}
async function run() {
  try {
    const servicesCollection = client.db("lawyerFirm").collection("services");
    const ordersCollection = client.db("lawyerFirm").collection("orders");
    const reviewsCollection = client.db("lawyerFirm").collection("reviews");

    // jwt token
    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1d",
      });
      res.send({ token });
    });

    // services get 3 api
    app.get("/servicesLimt3", async (req, res) => {
      const query = {};

      const cursor = servicesCollection.find(query);
      const servicesLimit3 = await cursor.limit(3).toArray();
      res.send(servicesLimit3);
    });

    // services all get api
    app.get("/servicesAll", async (req, res) => {
      const query = {};

      const cursor = servicesCollection.find(query);
      const services = await cursor.toArray();
      res.send(services);
    });

    app.get("/servicesAll/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await servicesCollection.findOne(query);
      res.send(service);
    });

    // orders api
    app.post("/orders", async (req, res) => {
      const order = req.body;
      const result = await ordersCollection.insertOne(order);
      res.send(result);
    });

    //orders api
    app.get("/orders", async (req, res) => {
      let query = {};
      if (req.query.email) {
        query = { email: req.query.email };
      }
      const cursor = ordersCollection.find(query);
      const orders = await cursor.toArray();
      res.send(orders);
    });
    // orders delete api
    app.delete("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await ordersCollection.deleteOne(query);
      res.send(result);
    });

    // reviews post api
    app.post("/reviews", async (req, res) => {
      const review = req.body;
      const result = await reviewsCollection.insertOne(review);
      res.send(result);
    });

    // reviews get with id api
    app.get("/reviews/:id", async (req, res) => {
      const id = req.params.id;
      const query = {
        id: id,
      };
      const sort = { timestamp: -1 };
      const cursor = reviewsCollection.find(query).sort(sort);
      const result = await cursor.toArray();

      res.send(result);
    });

    app.get("/editReviews/:id", async (req, res) => {
      const id = req.params.id;
      const query = {
        _id: ObjectId(id),
      };
      const cursor = reviewsCollection.find(query);
      const result = await cursor.toArray();

      res.send(result);
    });
    // reviews modified api
    app.patch("/reviews/:id", async (req, res) => {
      const id = req.params.id;
      const message = req.body.message;

      const query = { _id: ObjectId(id) };

      const updateDoc = {
        $set: {
          message: message,
        },
      };

      const result = await reviewsCollection.updateOne(query, updateDoc);
      res.send(result);
    });

    // reviews get with emial api
    app.get("/reviews", verifyJWT, async (req, res) => {
      let query = {};
      if (req.query.email) {
        query = { email: req.query.email };
      }
      const cursor = reviewsCollection.find(query);
      const reviews = await cursor.toArray();
      res.send(reviews);
    });
    //reviews delete api
    app.delete("/reviews/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await reviewsCollection.deleteOne(query);
      res.send(result);
    });
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Lawyer Server is Running");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
