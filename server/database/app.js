const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');
const cors = require('cors');

const app = express();
const port = 3030;

app.use(cors());
app.use(express.json());
app.use(express.raw({ type: '*/*' }));
app.use(express.urlencoded({ extended: false }));

const reviewsData = JSON.parse(fs.readFileSync('reviews.json', 'utf8'));
const dealershipsData = JSON.parse(fs.readFileSync('dealerships.json', 'utf8'));

mongoose.connect('mongodb://mongo_db:27017/', { dbName: 'dealershipsDB' });

const Reviews = require('./review');
const Dealerships = require('./dealership');

async function seedData() {
  await Reviews.deleteMany({});
  await Reviews.insertMany(reviewsData.reviews);
  await Dealerships.deleteMany({});
  await Dealerships.insertMany(dealershipsData.dealerships);
}

seedData().catch((error) => {
  console.error('Seed error:', error);
});

app.get('/', async (req, res) => {
  res.send('Welcome to the Mongoose API');
});

app.get('/fetchReviews', async (req, res) => {
  try {
    const documents = await Reviews.find().sort({ id: 1 });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching documents' });
  }
});

app.get('/fetchReviews/dealer/:id', async (req, res) => {
  try {
    const dealerId = Number(req.params.id);
    const documents = await Reviews.find({ dealership: dealerId }).sort({ id: 1 });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching documents' });
  }
});

app.get('/fetchDealers', async (req, res) => {
  try {
    const documents = await Dealerships.find().sort({ id: 1 });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching documents' });
  }
});

app.get('/fetchDealers/:state', async (req, res) => {
  try {
    const state = req.params.state;
    if (state === 'All') {
      const documents = await Dealerships.find().sort({ id: 1 });
      return res.json(documents);
    }
    const documents = await Dealerships.find({ state }).sort({ id: 1 });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching documents' });
  }
});

app.get('/fetchDealer/:id', async (req, res) => {
  try {
    const dealerId = Number(req.params.id);
    const document = await Dealerships.findOne({ id: dealerId });
    if (!document) {
      return res.status(404).json({ error: 'Dealer not found' });
    }
    res.json(document);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching documents' });
  }
});

const insertReviewHandler = async (req, res) => {
  try {
    let data = req.body;
    if (Buffer.isBuffer(data)) {
      data = JSON.parse(data.toString());
    } else if (typeof data === 'string') {
      data = JSON.parse(data);
    }

    const documents = await Reviews.find().sort({ id: -1 }).limit(1);
    const newId = documents.length > 0 ? documents[0].id + 1 : 1;

    const review = new Reviews({
      id: newId,
      user_id: data.user_id,
      name: data.name,
      dealership: Number(data.dealership),
      review: data.review,
      time: data.time,
      purchase: Boolean(data.purchase),
      purchase_date: data.purchase_date || '',
      car_make: data.car_make || '',
      car_model: data.car_model || '',
      car_year: data.car_year ? Number(data.car_year) : undefined,
    });

    const savedReview = await review.save();
    res.json(savedReview);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error inserting review' });
  }
};

app.post('/insert_review', insertReviewHandler);
app.post('/insertReview', insertReviewHandler);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
