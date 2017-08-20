/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View
} from 'react-native';
import TabBar from './app/TabBarIos/TabBarIos'

export default class firstApp extends Component {
  constructor(props){
    super(props)
    this.state={
      clickCount:0
    }
  }
  handleClick(){
    let myCount = this.state.clickCount
    myCount=myCount+1
    this.setState({
      clickCount:myCount
    })
  }
  render() {
    return (
        <TabBar />
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

AppRegistry.registerComponent('firstApp', () => firstApp);
