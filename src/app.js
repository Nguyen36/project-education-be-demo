const express = require('express');

const cors = require('cors');

const app = express();

app.use(cors());

app.use(express.json());

// Routes

const routes = require('./routes');

app.use('/api', routes);

// Error handling middleware

app.use((err, req, res, next) => {

  console.error(err.stack);

  res.status(500).send('Something broke!');

});
app.use(cors({
  origin: "*", 
  methods: ["GET","POST","PUT","DELETE"],
}));

module.exports = app;
