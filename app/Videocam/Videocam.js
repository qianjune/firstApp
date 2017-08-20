'use strict';

import React, {Component} from 'react'
import {
  View,
  Text,
  StyleSheet,
} from 'react-native'
import Header from '../Header/Header'
import VideoList from './VideoList/VideoList'
export default class VideocamExample extends Component{
  constructor(props) {
    super(props)
    this.state={

    }
  }
  render(){
    return(
      <View style={style.container}>
        <Header />
        <VideoList />
      </View>
    )
  }
}

const style = StyleSheet.create({
  container:{
    flex:1
    // alignItems:'center',
    // justifyContent:'center'
  }
})
