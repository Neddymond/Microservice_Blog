const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const port = process.env.PORT || 4001;
const { randomBytes } = require('crypto');
const cors = require('cors');
const axios = require('axios');

const commentsByPostId = {};

app.use(bodyParser.json());
app.use(cors());

app.post('/posts/:id/comments', async (req, res) => {
  const id = randomBytes(4).toString('hex');
  const { content } = req.body;

  const comments = commentsByPostId[req.params.id] || [];

  comments.push({ id, content, status: 'pending' });

  commentsByPostId[req.params.id] = comments;

  // Emit an event whenever a comment is createed
  await axios.post('http://event-bus-srv:4005/events', {
    type: 'CommentCreated',
    data: {
      id, 
      content,
      postId: req.params.id,
      status: 'pending'
    }
  });

  res.status(201).send(comments);
});

app.get('/posts/:id/comments', (req, res) => {
  res.send(commentsByPostId[req.params.id] || []);
});

app.post('/events', async (req, res) => {
  console.log('Received event: ', req.body.type);

  const { type, data } = req.body;

  if (type === 'CommentModerated') {
    const { id, postId, status, content } = data;
    const comments = commentsByPostId[postId];
    const comment = comments.find(comment => comment.id === id);
    comment.status = status;

    await axios.post('http://event-bus-srv:4005/events', {
      type: 'CommentUpdated',
      data: {
        id,
        postId,
        content,
        status
      }
    });
  }

  res.send({});
});

app.listen(port, () => console.log(`server is listening on port ${port}`));