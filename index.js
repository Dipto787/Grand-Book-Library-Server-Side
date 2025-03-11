let express = require('express');
let app = express();
let cors = require('cors');
app.use(cors());
app.use(express.json());
require('dotenv').config()
let port = process.env.PORT || 5000;
let jwt=require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jt86e.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
        await client.connect();
        let booksCollection = client.db('Grand-Book-library').collection('books');
        let cartCollection = client.db('Grand-Book-library').collection('myCart');
        app.get('/books', async (req, res) => {
            const page = parseInt(req.query.page);
            const size = parseInt(req.query.size);
            console.log(page, size)
            let result = await booksCollection.find()
                .skip(page * size)
                .limit(size)
                .toArray();
            res.send(result);
        })
        app.get('/bookCount', async (req, res) => {

            let counted = await booksCollection.estimatedDocumentCount();
            res.send({ counted })
        })

        app.get('/myCart/:email', async (req, res) => {
            let email = req.params.email;
            let query = { email: email };
            let result = await cartCollection.find(query).toArray();
            res.send(result);

        })

        app.post('/myCart', async (req, res) => {
            let cart = req.body;
            let result = await cartCollection.insertOne(cart);
            res.send(result);
        })

        app.delete('/myCart/:id', async (req, res) => {
            let id = req.params.id;
            let query = { _id: new ObjectId(id) };
            let result = await cartCollection.deleteOne(query);
            res.send(result);
        })


        // Connect the client to the server	(optional starting in v4.7)
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
    res.send('basic setup complete')
})


app.listen(port, () => {
    console.log(`grand book library server run port no ${port}`)
})