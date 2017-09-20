

import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Modal,
  AlertIOS,
  AsyncStorage,
} from 'react-native';
import Button from 'react-native-button';
import Icon from 'react-native-vector-icons/Ionicons';
import Video from 'react-native-video';
import util from '../../../common/util';
import Comment from './Comment';
import request from '../../../common/request';
import requestConfig from '../../../common/config';

const width = Dimensions.get('window').width;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 80,
  },
  modalContainer: {
    flex: 1,
    paddingTop: 45,
    backgroundColor: '#fff',
  },
  closeIcon: {
    alignSelf: 'center',
    fontSize: 30,
    color: '#ee753c',
  },
  submitBtn: {
    alignSelf: 'center',
    width: width - 20,
    padding: 16,
    marginTop: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ee735c',
    borderRadius: 4,
    color: '#ee735c',
    fontSize: 18,
  },
  videoBox: {
    width,
    height: width * 0.56,
    backgroundColor: '#000',
  },
  video: {
    width,
    height: width * 0.56,
    backgroundColor: '#000',
  },
  loading: {
    position: 'absolute',
    left: 0,
    top: 80,
    width,
    alignSelf: 'center',
    backgroundColor: 'transparent',
  },
  progressBox: {
    width,
    height: 2,
    backgroundColor: '#ccc',
  },
  progressBar: {
    height: 2,
    backgroundColor: '#ff6600',
  },
  playIcon: {
    position: 'absolute',
    top: 80,
    left: width / 2 - 30,
    width: 60,
    height: 60,
    paddingTop: 8,
    paddingLeft: 22,
    backgroundColor: 'transparent',
    borderColor: '#fff',
    borderWidth: 1,
    borderRadius: 30,
    color: '#ed7b66',
  },
  pauseBtn: {
    position: 'absolute', // 为什么背景有颜色也不会遮住进度条
    left: 0,
    top: 0,
    width,
    height: 360,
    // backgroundColor:'red'
  },
  resumeIcon: {
    position: 'absolute',
    top: 80,
    left: width / 2 - 30,
    width: 60,
    height: 60,
    paddingTop: 8,
    paddingLeft: 22,
    backgroundColor: 'transparent',
    borderColor: '#fff',
    borderWidth: 1,
    borderRadius: 30,
    color: '#ed7b66',
  },
  failText: {
    position: 'absolute',
    left: 0,
    top: 180,
    width,
    textAlign: 'center',
    color: 'white',
    backgroundColor: 'transparent',
  },
  infoBox: {
    width,
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  descBox: {
    flex: 1,
  },
  nickname: {
    fontSize: 18,
  },
  title: {
    marginTop: 8,
    fontSize: 16,
    color: '#666',
  },
  avatar: {
    width: 60,
    height: 60,
    marginLeft: 10,
    marginRight: 10,
    borderRadius: 30,
  },
  scrollView: {
    height: 400,
  },
  commentBox: {
    marginTop: 10,
    marginBottom: 10,
    padding: 8,
    width,
  },
  content: {
    paddingLeft: 2,
    color: '#333',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    fontSize: 14,
    height: 80 },
});

export default class RecordingExample extends Component {
  state={
    videoLoaded: false,
    videoPlaying: false,
    data: this.props.data,
    rate: 1,
    muted: true,
    resizeMode: 'contain',
    repeat: false,
    videoProgress: 0.01,
    videoTotal: 0,
    paused: false,
    videoOk: true,
    modalVisible: false,
    content: '',
    isSending: false,
  }
  componentDidMount() {
    AsyncStorage.getItem('user')
      .then((data) => {
        let user;
        if (data) {
          user = JSON.parse(data);
        }
        if (user && user.accessToken) {
          this.setState({
            user,
          });
        }
      });
  }
  _onLoadStart=() => {
    console.log('start');
  }
  _onLoad=() => {
    console.log('loading');
  }
  _onProgress=(data) => {
    const duration = data.playableDuration;
    const currentTime = data.currentTime;
    const percent = Number(currentTime / duration).toFixed(2);
    const newState = Object.assign({}, this.state, {
      videoTotal: duration,
      currentTime: Number(currentTime).toFixed(2),
      videoProgress: percent,
    });
    if (!this.state.videoLoaded) {
      newState.videoLoaded = true;
    }
    if (!this.state.videoPlaying) {
      newState.videoPlaying = true;
    }
    this.setState(newState);
    console.log('progress', data);
  }
  _onEnd=() => {
    this.setState({
      videoProgress: 1,
      videoPlaying: false,
    });
    console.log('end');
  }
  _onError=(err) => {
    console.log(`err:${err}`);
    this.setState({
      videooK: false,
    });
  }
  _replay=() => {
    this.refs.videoPlayer.seek(0);
  }
  _pause=() => {
    if (!this.state.paused) {
      this.setState({
        paused: true,
      });
    }
  }
  _resume=() => {
    if (this.state.paused) {
      this.setState({
        paused: false,
      });
    }
  }
  _focus=() => {
    this._setModalVisible(true);
  }
  _closeModal=() => {
    this._setModalVisible(false);
  }
  _setModalVisible=(isShow) => {
    this.setState({
      modalVisible: isShow,
    });
  }
  _blur=() => {

  }
  _submit=() => {
    const { content } = this.state;
    if (!content) {
      return AlertIOS.alert('评论不能为空');
    }
    if (this.state.isSending) {
      return AlertIOS.alert('正在评论中');
    }
    this.setState({
      isSending: true,
    }, () => {
      const body = {
        accessToken: this.state.user.accessToken,
        creation: this.props.data._id,
        content: this.state.content,
      };
      const url = requestConfig.api.base + requestConfig.api.comment;
      request.post(url, body)
        .then((data) => {
          if (data && data.success) {
            // 这里可以重新请求列表
            this.setState({
              content: '',
              isSending: false,
            });
            this._setModalVisible(false);
          }
        })
        .catch((err) => {
          console.log(err);
          this.setState({
            isSending: false,
          });
          this._setModalVisible(false);
          AlertIOS.alert('留言失败，请稍后重试');
        });
    });
  }
  render() {
    const { data } = this.state;
    return (
      <View style={styles.container}>
        <View style={styles.videoBox}>
          <Video
            ref="videoPlayer"
            source={{ uri: util.thumb(data.qiniu_video) }}
            style={styles.video}
            volume={5}
            paused={this.state.paused} // 进来以后是否直接播放
            rate={this.state.rate} // 是否暂停
            muted={false} // 静音
            resizeMode={this.state.resizeMode}// 拉伸方式
            repeat={this.state.repeat} // 重复播放
            onLoadStart={this._onLoadStart} // 视频开始
            onLoad={this._onLoad} // 播放中
            onProgress={this._onProgress} // 每个250ms传个时间
            onEnd={this._onEnd}
            onError={this._onError}
          />
          {
            !this.state.videoOk && <Text style={styles.failText}>视频出错了</Text>
          }
          {
            !this.state.videoLoaded &&
            <ActivityIndicator
              // animating={this.state.animating}
              color="#ee735c"
              style={styles.loading}
              // size="large"
            />
          }
          {
            (this.state.videoLoaded &&
            !this.state.videoPlaying) ?
              <Icon onPress={this._replay} name="ios-play" size={48} style={styles.playIcon} /> : null
          }
          {
            this.state.videoLoaded &&
            this.state.videoPlaying ?
              <TouchableOpacity
                onPress={this._pause}
                style={styles.pauseBtn}
              >
                {
                  this.state.paused ?
                    <Icon onPress={this._resume} name="ios-play" size={48} style={styles.resumeIcon} /> : <Text />
                }
              </TouchableOpacity>
              :
              null
          }
          <View style={styles.progressBox}>
            <View style={[styles.progressBar, { width: width * this.state.videoProgress }]} />
          </View>
        </View>
        <ScrollView
          automaticallyAdjustContentInsets={false}
          enableEmptySections
          showsVerticalScrollIndicator={false}
          style={styles.scrollView}
        >
          <View style={styles.infoBox}>
            <Image style={styles.avatar} source={{ uri: util.avatar(data.author.avatar) }} />
            <View style={styles.descBox}>
              <Text style={styles.nickname}>{data.author.nickname}</Text>
              <Text style={styles.title}>{data.title}</Text>
            </View>
          </View>
          <View style={styles.commentBox}>
            <View style={styles.comment}>
              <TextInput placeholder="评论一个" style={styles.content} multiline onFocus={this._focus} />
            </View>
          </View>
        </ScrollView>
        <View>
          <Text>
            精彩评论
          </Text>
        </View>
        {
          this.state.user ?
            <Comment data={data} user={this.state.user} /> : null
        }

        <Modal
          animationType={'fade'}
          visible={this.state.modalVisible}
          onRequestClose={() => { this._setModalVisible(false); }}
        >
          <View style={styles.modalContainer}>
            <Icon onPress={this._closeModal} name="ios-close-outline" style={styles.closeIcon} />
            <View style={styles.commentBox}>
              <View style={styles.comment}>
                <TextInput
                  placeholder="评论一个"
                  style={styles.content}
                  multiline
                  onBlur={this._blur}
                  defaultValue={this.state.content}
                  onChangeText={(text) => {
                    this.setState({
                      content: text,
                    });
                  }}
                />
              </View>
            </View>
            <Button style={styles.submitBtn} onPress={this._submit}>评论</Button>
          </View>
        </Modal>
      </View>
    );
  }
}
