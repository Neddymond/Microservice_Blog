const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const port = process.env.PORT || 4000;
const { randomBytes } = require('crypto');
const cors = require('cors');
const axios = require('axios');

const posts = {};

app.use(bodyParser.json());
app.use(cors());

app.post('/posts', async (req, res) => {
  const id = randomBytes(4).toString('hex');
  const { title } = req.body;

  posts[id] = { id, title };

  // Emit an event whenever a post is created
  await axios.post('http://event-bus-srv:4005/events', {
    type: 'PostCreated',
    data: { id, title }
  });

  res.status(201).send(posts[id]);
});

app.get('/posts', (req, res) => { res.send(posts); });

app.post('/events', (req, res) => {
  console.log('Received Event: ', req.body.type);
  
  res.send({});
});

app.listen(port, () => {
  console.log('latest');
  console.log(`server is listening on port ${port}`)
});

module.exports = posts;