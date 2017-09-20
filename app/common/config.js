

module.exports = {
  CLOUDINARY: {
    cloud_name: 'qjune',
    api_key: '586975228138865',
    api_secret: 'GGvaj8rTxuMDuhGube06Cj3pFoA',
    base: 'http://res.cloudinary.com/qjune',
    image: 'https://api.cloudinary.com/v1_1/qjune/image/upload',
    video: 'https://api.cloudinary.com/v1_1/qjune/video/upload',
    audio: 'https://api.cloudinary.com/v1_1/qjune/raw/upload',
  },
  qiniu: {
    upload: 'http://upload.qiniu.com',
    thumb: 'http://ow1yrae07.bkt.clouddn.com/',
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
    base: 'http://harryjim8.natapp1.cc/',
    creations: 'api/creations',
    up: 'api/up',
    comments: 'api/comments',
    comment: 'api/comment',
    signup: 'api/u/signup',
    verify: 'api/u/verify',
    signature: 'api/signature',
    update: 'api/u/update',
    video: 'api/creations/video',
    audio: 'api/creations/audio',
  },
};
