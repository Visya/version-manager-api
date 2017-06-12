const express = require('express');
const bodyParser = require('body-parser');
const omit = require('lodash.omit');

const cacheMiddleware = require('./cache-middleware');
const versionManager = require('./version-manager');

const app = express();

app.use(bodyParser.json());
app.enable('etag');

app.get('/config/:client/:version', cacheMiddleware, (req, res) => {
  versionManager
    .find({
      client: req.params.client,
      version: req.params.version
    })
    .then((resource) => res.send(resource))
    .catch(() => res.sendStatus(304));
});

app.post('/config', (req, res) => {
  let { version, client } = req.body;
  let data = omit(req.body, 'version', 'client');

  if (!version || !client) {
    return res.status(404).send('Missing version or client');
  }

  versionManager
    .create({version, client, data})
    .then(() => res.sendStatus(201))
    .catch((error) => res.sendStatus(error.code));
});

app.use((error, req, res, next) => {
  if (error) {
    return res.sendStatus(304);
  }

  next();
});

app.listen(3000, () => console.log('Server is listening to port 3000'));
