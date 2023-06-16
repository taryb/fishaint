const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const path = require('path');

const app = express();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

const uri = "mongodb+srv://tbounavo:FOFVHjf9F67dXdcP@cluster0.amccmlf.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const corsOptions = {
  origin: 'https://fishaint-taryb.vercel.app',
};

app.use(cors(corsOptions));
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use(express.static(path.join(__dirname, 'dist')));

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

    const result = await collection.insertOne(log);
    console.log('Log saved successfully');
  } catch (err) {
    console.error('Error saving log:', err);
  } finally {
    await client.close();
  }
}

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.post('/api/logs', upload.single('image'), (req, res) => {
  const { species, size, weight, location, date } = req.body;
  const image = req.file ? req.file.filename : null;

  const log = {
    species: species,
    size: size,
    weight: weight,
    location: location,
    date: date,
    image: image
  };

  saveLog(log)
    .then(() => res.sendStatus(200))
    .catch(() => res.status(500).send('Error saving log'));
});

app.get('/api/logs', async (req, res) => {
  try {
    await client.connect();
    const db = client.db("fishingLogs");
    const collection = db.collection("logs");

    const fishEntries = await collection.find({}).toArray();
    res.json(fishEntries);
  } catch (err) {
    console.error('Error fetching fish entries:', err);
    res.status(500).send('Error fetching fish entries');
  } finally {
    await client.close();
  }
});

async function run() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    await initializeDatabase();
  } finally {
    await client.close();
  }
}

run().catch(console.dir);

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server running on port ${process.env.PORT || 3000}`);
});
