const config = require('./config');

exports.thumb = function (key) {
  if (key.indexOf('http') > -1) return key;

  return config.qiniu.thumb + key;
};

exports.avatar = (id, type) => {
  if (id.indexOf('http') > -1) {
    return id;
  }
  if (id.indexOf('data:image') > -1) {
    return id;
  }
  if (id.indexOf('avatar/') > -1) {
    return `${config.CLOUDINARY.base}/${type}/upload/${id}`;
  }
  return `http://ovtw0gn3p.bkt.clouddn.com/${id}`;
};
