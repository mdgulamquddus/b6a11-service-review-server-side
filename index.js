const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.h6dt8.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const casesCollection = client.db("lawyerFirm").collection("cases");

    // cases get 3 api
    app.get("/casesLimt3", async (req, res) => {
      const query = {};

      const cursor = casesCollection.find(query);
      const cases = await cursor.limit(3).toArray();
      res.send(cases);
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
