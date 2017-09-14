

module.exports = {
  qiniu: {
    upload: 'http://upload.qiniu.com',
  },
  header: {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  },
  api: {
    // base:'http://rapapi.org/mockjs/24457/',
    // base:'http://localhost:1234/',
    base: 'https://qjune.s1.natapp.cc/',
    creations: 'api/creations',
    up: 'api/up',
    comments: 'api/comments',
    comment: 'api/comment',
    signup: 'api/u/signup',
    verify: 'api/u/verify',
    signature: 'api/signature',
    update: 'api/u/update',
    video: 'api/creations/video',
  },
};
