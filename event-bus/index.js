const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const axios = require('axios');

const port = 4005;
app.use(bodyParser.json());

const events = [];

app.post('/events', async (req, res) => {
  const event = req.body;

  events.push(event);

  axios.post('http://post-clusterip-srv:4000/events', event);
  axios.post('http://comments-srv:4001/events', event);
  axios.post('http://query-srv:4002/events', event);
  axios.post('http://moderation-srv:4003/events', event);

  res.send({ status: 'OK' });
});

app.get('/events', (req, res) => {
  res.send(events);
});

app.listen(port, () => console.log(`listening on port ${port}`));