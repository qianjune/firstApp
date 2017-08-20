'use strict';

import React, {Component} from 'react'
import {
  View,
  Text,
  StyleSheet,
} from 'react-native'

export default class MoreExample extends Component{
  constructor(props) {
    super(props)
    this.state={

    }
  }
  render(){
    return(
      <View style={style.container}>
        <Text>
          我是更多信息
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
