const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');

const uri = "mongodb+srv://tbounavo:FOFVHjf9F67dXdcP@cluster0.amccmlf.mongodb.net/?retryWrites=true&w=majority";

const app = express();
const port = 8003; // Replace with your desired port number

app.use(bodyParser.json());
app.use(cors()); // Enable CORS for all routes

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function initializeDatabase() {
  try {
    await client.connect();
    const db = client.db("fishingLogs");

    // Create the database if it doesn't exist
    const dbList = await client.db().admin().listDatabases();
    const databaseExists = dbList.databases.some((database) => database.name === "fishingLogs");
    if (!databaseExists) {
      await db.createCollection("logs");
      console.log("Created fishingLogs database and logs collection.");
    } else {
      // Create the logs collection if it doesn't exist
      const collectionList = await db.listCollections().toArray();
      const collectionExists = collectionList.some((collection) => collection.name === "logs");
      if (!collectionExists) {
        await db.createCollection("logs");
        console.log("Created logs collection.");
      }
    }
  } catch (err) {
    console.error('Error initializing database:', err);
  } finally {
    await client.close();
  }
}

async function saveLog(log) {
  try {
    await client.connect();
    const db = client.db("fishingLogs");
    const collection = db.collection("logs");

    const { notes } = log;

    const result = await collection.insertOne({ text: log });
    console.log('Log saved 1 successfully');

    console.log('Log saved successfully');
  } catch (err) {
    console.error('Error saving log:', err);
  } finally {
    await client.close();
  }
}

app.post('/api/logs', (req, res) => {
  const { notes } = req.body;
  const log = {
    notes: notes
  };

  saveLog(log)
    .then(() => res.sendStatus(200))
    .catch(() => res.status(500).send('Error saving log'));
});

async function run() {
  try {
    // Connect the client to the server (optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    // Initialize the database and collections
    await initializeDatabase();
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}

run().catch(console.dir);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
