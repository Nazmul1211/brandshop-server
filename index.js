const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vblwbuh.mongodb.net/?retryWrites=true&w=majority`;

console.log(uri);

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    client.connect();

    const database = client.db('productDB');
    const productCollection = database.collection('product');
    const brandCollection = database.collection('brand');
    const userCartCollection = database.collection('userCart');


    // update product => api
    app.put('/products/:id', async (req, res) => {
      console.log('put method hitting')
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedProduct = req.body;
      const product = {
        $set: {
          brandName: updatedProduct.brandName,
          description: updatedProduct.description,
          photo: updatedProduct.photo,
          price: updatedProduct.price,
          productName: updatedProduct.productName,
          rating: updatedProduct.rating,
          type: updatedProduct.type
        }
      }
      const result = await productCollection.updateOne(filter, product, options);
      res.send(result)

    })

    // get single product => api
    app.get('/products/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productCollection.findOne(query);
      res.send(result);
    })

    // get all product => api
    app.get('/products', async (req, res) => {
      const cursor = productCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    // insert one document or product => api
    app.post('/products', async (req, res) => {
      const product = req.body;
      console.log(product);
      const result = await productCollection.insertOne(product);
      res.send(result);

    })

    // Add userCart data in the database
    app.delete('/userCart/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await userCartCollection.deleteOne(query);
      res.send(result);
    })

    app.get('/userCart', async (req, res) => {
      const cursor = userCartCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    app.post('/userCart', async (req, res) => {
      const userCart = req.body;
      console.log("userCart hitting", userCart);
      const result = await userCartCollection.insertOne(userCart);
      res.send(result);
    })


    // ADD SERVER specifically in the server
    app.get('/brands', async (req, res) => {
      const cursor = brandCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    app.post('/brands', async (req, res) => {
      const brand = req.body;
      const result = await brandCollection.insertOne(brand);
      res.send(result);
    })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('hello word');
})

app.listen(port, () => {
  console.log(`Brand shop server is running on port: ${port}`);
})