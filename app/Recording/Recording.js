'use strict';

import React, {Component} from 'react'
import {
  View,
  Text,
  StyleSheet,
} from 'react-native'

export default class RecordingExample extends Component{
  constructor(props) {
    super(props)
    this.state={

    }
  }
  render(){
    return(
      <View style={style.container}>
        <Text>
          我是上传视频
        </Text>
      </View>
    )
  }
}

const style = StyleSheet.create({
  container:{
    flex:1,
    alignItems:'center',
    justifyContent:'center'
  }
})
