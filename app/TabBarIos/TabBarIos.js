'use strict';

import React, { Component } from 'react';
import Icon from 'react-native-vector-icons/Ionicons'
import {
  StyleSheet,
  Text,
  View,
  TabBarIOS,
  NavigatorIOS,
} from 'react-native';
import Videocam from '../Videocam/Videocam'
import Recording from '../Recording/Recording'
import More from '../More/More'

class TabBarExample extends Component{
  state={
    selectedTab: 'videocam',
    notifCount: 0,
    presses: 0,
  }
  // _handleNavigationRequest() {
  //     this.refs.videocam.push({
  //       component:Recording,
  //       title: '视频详情',
  //       passProps: { myProp: 'genius' },
  //     });
  //   }
  render() {
    return (
      <TabBarIOS
        unselectedTintColor="yellow"
        tintColor="#ee735c"
      >
        <Icon.TabBarItem
          iconName={'ios-videocam-outline'}
          selectedIconName={'ios-videocam'}
          selected={this.state.selectedTab === 'videocam'}
          onPress={() => {
            this.setState({
              selectedTab: 'videocam',
            });
          }}>
          <NavigatorIOS
            ref='videocam'
            initialRoute={{
              component: Videocam,
              title: '视频列表',
              passProps: {
              
              },
            }}
            style={{flex: 1}}
           />
        </Icon.TabBarItem>
        <Icon.TabBarItem
          iconName={'ios-recording-outline'}
          selectedIconName={'ios-recording'}
          selected={this.state.selectedTab === 'recording'}
          onPress={() => {
            this.setState({
              selectedTab: 'recording',
              notifCount: this.state.notifCount + 1,
            });
          }}>
          <NavigatorIOS
            initialRoute={{
              component: Recording,
              title: '视频详情',
            }}
            style={{flex: 1}}
           />
        </Icon.TabBarItem>
        <Icon.TabBarItem
          iconName={'ios-more-outline'}
          selectedIconName={'ios-more'}
          selected={this.state.selectedTab === 'more'}
          onPress={() => {
            this.setState({
              selectedTab: 'more',
              presses: this.state.presses + 1
            });
          }}>
          <More />
        </Icon.TabBarItem>
      </TabBarIOS>
    );
  }

}

const styles = StyleSheet.create({
  tabContent: {
    flex: 1,
    alignItems: 'center',
  },
  tabText: {
    color: 'white',
    margin: 50,
  },
});

export default TabBarExample
