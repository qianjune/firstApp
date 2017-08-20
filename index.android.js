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

export default class firstApp extends Component {
  construst(props){
    super(props)
    this.state={
      clickCount:0
    }
  }
  handleClick(){
    let myCount = this.state.clickCount
    myCount=+1
    this.setState({
      clickCount:myCount
    })
  }
  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome} onPress={()=>{this.handleClick()}}>
          点我
        </Text>
        <Text style={styles.instructions}>
          {this.state.clickCount}
        </Text>
        <Text style={styles.instructions}>
          Double tap R on your keyboard to reload,{'\n'}
          Shake or press menu button for dev menu
        </Text>
      </View>
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
