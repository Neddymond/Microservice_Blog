const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
const port = 4003;
app.use(bodyParser.json());

app.post('/events', async (req, res) => {
  const { type, data } = req.body;

  if (type === 'CommentCreated') {
    const status = data.content.includes('orange') ? 'rejected' : 'approved';

    await axios.post('http://event-bus-srv:4005/events', {
      type: 'CommentModerated',
      data: {
        id: data.id,
        status,
        postId: data.postId,
        content: data.content
      }
    });
  }

  res.send({});
});

app.listen(port, () => console.log(`Listening on port ${port}`));