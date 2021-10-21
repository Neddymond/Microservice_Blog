const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const port = 4002;
const posts = {};

const handleEvents = (type, data) => {
  switch (type) {
    case 'PostCreated': {
      const { id, title } = data;
      posts[id] = { id, title, comments: [] };
      break;
    }
    
    case 'CommentCreated': {
      const { id, content, postId, status } = data;
      posts[postId].comments.push({ id, content, status });
      break;
    }
    
    case 'CommentUpdated': {
      const { id, postId, content, status } = data;
      const comment = posts[postId].comments.find(comment => comment.id === id);
      
      comment.status = status;
      comment.content = content;
      break;
    }

    default:
      break;
  }
};

app.get('/posts', (req, res) => res.send(posts));

app.post('/events', (req, res) => {
  const { type, data } = req.body;

  handleEvents(type, data);

  res.send({});
});

app.listen(port, async () => {
  console.log(`Listening on port ${port}`);

  const res = await axios.get('http://localhost:4005/events');

  for (let event of res.data) {
    console.log('Processing event:', event.type);

    handleEvents(event.type, event.data);
  }
});