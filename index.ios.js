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
  View,
  AsyncStorage
} from 'react-native';
import TabBar from './app/TabBarIos/TabBarIos'
import Login from './app/More/Login'
export default class firstApp extends Component {
  constructor(props){
    super(props)
    this.state={
      clickCount:0,
      logined:false
    }
  }
  componentDidMount(){
    this._asyncAppStatus()
  }
  _asyncAppStatus=()=>{
    AsyncStorage.getItem('user')
      .then((data)=>{
        console.log(data);
        let user={}
        let newState={}
        if(data){
          user=JSON.parse(data)
        }
        console.log(user);
        if(user&&user.accessToken){
          newState.user=user
          newState.logined=true
        }else{
          newState.logined=false
        }
        this.setState(newState)
      })
  }
  handleClick(){
    let myCount = this.state.clickCount
    myCount=myCount+1
    this.setState({
      clickCount:myCount
    })
  }
  _afterLogin=(user)=>{
    user = JSON.stringify(user)
    AsyncStorage.setItem('user',user)
      .then(()=>{
        this.setState({
          logined:true,
          // user:user
        })
      })
  }
  render() {
    if(!this.state.logined){
      return <Login afterLogin={this._afterLogin}/>
    }
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
