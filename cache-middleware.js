const omit = require('lodash.omit');

const cache = {};

function withCache({ oldETag, data, eTag }) {
  try {
    data = JSON.parse(data.toString());
  } catch (e) {
    console.debug('Invalid body');
    data = {};
  }

  cache[eTag] = data;

  if (oldETag && cache[oldETag]) {
    data = omit(data, Object.keys(cache[oldETag]));
  }

  return JSON.stringify(data);
}

module.exports = function(req, res, next) {
  let oldEnd = res.end;

  res.end = function(data, ...args) {
    const eTag = this.get('ETag');
    const oldETag = this.req.get('if-none-match');

    if (!data) {
      return oldEnd.call(this, data, ...args);
    }

    if (eTag === oldETag) {
      res.status(304);
      data = '';
    } else {
      data = withCache({ oldETag, eTag, data });
    }

    this.set('Content-Length', data.length);
    oldEnd.call(this, data, ...args);
  };

  next();
};
