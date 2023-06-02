const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://tbounavo:FOFVHjf9F67dXdcP@cluster0.amccmlf.mongodb.net/?retryWrites=true&w=majority";

const app = express();
const port = 8023; // Replace with your desired port number

app.use(bodyParser.json());

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

      // Generate random data
      const randomLogs = [
        { photo: "photo1.jpg", location: "Location 1", date: "2023-05-30", notes: "Random notes 1" },
        { photo: "photo2.jpg", location: "Location 2", date: "2023-05-31", notes: "Random notes 2" },
        { photo: "photo3.jpg", location: "Location 3", date: "2023-06-01", notes: "Random notes 3" }
      ];

      // Insert the random logs into the collection
      const collection = db.collection("logs");
      await collection.insertMany(randomLogs);
      console.log("Inserted random logs into the logs collection.");
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

    const { photo, location, date, notes } = log;
    const result = await collection.insertOne({
      photo: photo,
      location: location,
      date: date,
      notes: notes
    });
    console.log('Log saved successfully');
  } catch (err) {
    console.error('Error saving log:', err);
  } finally {
    await client.close();
  }
}

app.post('/api/logs', (req, res) => {
  const { photo, location, date, notes } = req.body;
  const log = {
    photo: photo,
    location: location,
    date: date,
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
