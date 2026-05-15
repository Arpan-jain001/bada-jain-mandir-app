const { v4: uuidv4 } = require('uuid');

function publicId() {
  return uuidv4();
}

module.exports = { publicId };
