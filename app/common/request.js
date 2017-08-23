'use strict'
import Mock from 'mockjs'
import queryString from 'query-string'
import _ from 'lodash'

const config=require('./config')

const request={}

request.get = (url,params)=>{
  if(params){
    url+=`?${queryString.stringify(params)}`
    console.log(url);
  }
  return fetch(url)
    .then((response)=>response.json())
    .then((responseJson)=>Mock.mock(responseJson))
}

request.post = (url,body)=>{
  const options = _.assignIn(config.header,{
    body:JSON.stringify(body)
  })
  return fetch(url,options)
    .then((response)=>response.json())
    .then((responseJson)=>Mock.mock(responseJson))
}

// fetch('http://rapapi.org/mockjs/24457/api/creations?accessToken=abcd')
//   .then((response) => response.json())
//   .then((responseJson) => {
//
//     const data = Mock.mock(responseJson)
//     console.log(data);
//     if(data.success){
//       this.setState({
//         dataSource:this.state.dataSource.cloneWithRows(data.data)
//       })
//     }
//     // return data;
//   })
//   .catch((error) => {
//     console.error(error);
//   });


module.exports=request
