import React, { Component } from 'react';
import {
  ListView,
  Text,
  TouchableHighlight,
  Image,
  ImageBackground,
  StyleSheet,
  View,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  AlertIOS,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Detail from './VideoDetail/Detail';
import request from '../../common/request';
import requestConfig from '../../common/config';

const width = Dimensions.get('window').width;

export default class VideoExample extends Component {
  state={
    up: false,
  }
  _up=() => {
    const up = !this.state.up;
    const { rowData } = this.props;
    const url = requestConfig.api.base + requestConfig.api.up;

    const body = {
      id: rowData._id,
      up: up ? 'yes' : 'no',
      accessToken: 'abcd',
    };
    request.post(url, body)
      .then((data) => {
        if (data && data.success) {
          this.setState({
            up,
          });
        } else {
          AlertIOS.alert('点赞失败，稍后重试');
        }
      })
      .catch((err) => {
        console.log(err);
        AlertIOS.alert('点赞失败，稍后重试');
      });
  }
  _handleNavigationRequest=(data) => {
    this.props.navigator.push({
      component: Detail,
      title: '视频详情',
      passProps: { data },
    });
  }
  render() {
    const { rowData } = this.props;
    return (
      <TouchableHighlight onPress={this._handleNavigationRequest.bind(this, rowData)}>
        <View style={styles.item}>
          <Text style={styles.title}>
            {rowData.title}
          </Text>
          <ImageBackground
            source={{ uri: rowData.thumb }}
            style={styles.thumb}
          >
            <Icon name="ios-play" size={28} style={styles.play} />
          </ImageBackground>
          <View style={styles.itemFooter}>
            <View style={styles.handleBox}>
              <Icon
                name={this.state.up ? 'ios-heart' : 'ios-heart-outline'}
                size={28}
                style={styles.up}
                style={[styles.up, this.state.up ? null : styles.down]}
                onPress={this._up}
              />
              <Text
                style={styles.handleText}
                onPress={this._up}
              >喜欢</Text>
            </View>
            <View style={styles.handleBox}>
              <Icon
                name="ios-chatbubbles-outline"
                size={28}
                style={styles.commentIcon}
              />
              <Text style={styles.handleText}>评价</Text>
            </View>
          </View>
        </View>
      </TouchableHighlight>
    );
  }
}

const styles = StyleSheet.create({
  item: {
    width,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  title: {
    padding: 10,
    fontSize: 18,
    color: '#333',
  },
  thumb: {
    width,
    height: width * 0.56,
    // resizeMode:'cover'
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#eee',
  },
  handleBox: {
    padding: 10,
    flexDirection: 'row',
    width: width / 2 - 0.5,
    justifyContent: 'center',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  play: {
    position: 'absolute',
    bottom: 14,
    right: 14,
    width: 46,
    height: 46,
    paddingTop: 9,
    paddingLeft: 18,
    backgroundColor: 'transparent',
    borderColor: '#fff',
    borderWidth: 1,
    borderRadius: 23,
    color: '#ed7b66',
  },
  down: {
    fontSize: 22,
    color: '#333',
  },
  up: {
    fontSize: 22,
    color: 'red',
  },
  handleText: {
    paddingLeft: 12,
    fontSize: 18,
    color: '#333',
  },
  commentIcon: {
    fontSize: 22,
    color: '#333',
  },
});
