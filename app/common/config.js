'use strict'

module.exports = {
  header:{
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  },
  api:{
    base:'http://rapapi.org/mockjs/24457/',
    creations:'api/creations',
    up:'api/up',
    comments:'api/comments',
    comment:'api/comment',
    signup:'api/u/signup',
    verify:'api/u/verify',
    signature:'api/signature',
    update:'api/u/update'
  }
}
