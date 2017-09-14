import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  AsyncStorage,
  ProgressViewIOS,
  AlertIOS,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import ImagePicker from 'react-native-image-picker';
import { CountDownText } from 'react-native-sk-countdown';
import Video from 'react-native-video';
import request from '../common/request';
import config from '../common/config';


const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  toolbar: {
    flexDirection: 'row',
    paddingTop: 25,
    paddingBottom: 12,
    backgroundColor: '#ee735c',
  },
  toolbarTitle: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
  toolbarEdit: {
    position: 'absolute',
    right: 10,
    top: 26,
    color: '#fff',
    textAlign: 'right',
    fontWeight: '600',
    fontSize: 14,
  },
  page: {
    flex: 1,
    alignItems: 'center',
  },
  uploadContainer: {
    marginTop: 90,
    width: width - 40,
    paddingBottom: 10,
    borderWidth: 1,
    borderColor: '#ee735c',
    backgroundColor: '#fff',
    justifyContent: 'center',
    borderRadius: 6,
  },
  uploadBox: {
    // flex:1,
    // flexDirection:'column',
    // justifyContent:'center',
    // alignItems:'center'
  },
  uploadTitle: {
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 10,
    color: '#000',
  },
  uploadDesc: {
    color: '#999',
    textAlign: 'center',
    fontSize: 12,
  },
  uploadIcon: {
    textAlign: 'center',
    fontSize: 30,
    marginBottom: 10,
    marginTop: 10,
  },
  videoContainer: {
    width,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  videoBox: {
    width,
    height: height * 0.6,
  },
  video: {
    width,
    height: height * 0.6,
    backgroundColor: '#333',
  },
  progressBox: {
    // position:'absolute',
    // left:0,
    // bottom:0,
    width,
    height: 30,
    backgroundColor: 'rgba(244,244,244,0.65)',
  },
  progressTip: {
    color: '#333',
    width: width - 10,
    padding: 5,
  },
  progressBar: {
    width,
  },
  recordBox: {
    width,
    height: 60,
    alignItems: 'center',
  },
  recordIconBox: {
    marginTop: -45,
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#ee735c',
    borderWidth: 1,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBtn: {
    fontSize: 32,
    fontWeight: '600',
    color: '#fff',
  },
  recordIcon: {
    fontSize: 58,
    backgroundColor: 'transparent',
    color: '#fff',
  },
  recordOn: {
    backgroundColor: '#ccc',
  },
});


export default class RecordingExample extends Component {
  constructor(props) {
    super(props);
    this.state = {
      counting: false,
      recording: false,
      videoProgress: 0.01,
      previewVideo: null,
      videoUploaded: false,
      videoUploading: false,
      videoUploadingProgress: 0.01,
      video: null,
      videoPlaying: false,
      rate: 1,
      muted: true,
      resizeMode: 'contain',
      repeat: false,
      videoTotal: 0,
      currentTime: 0,
      paused: false,
      videoOk: true,
      modalVisible: false,
      content: '',
      isSending: false,
    };
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
  _pickVideo=() => {
    const options = {
      title: '选择视频',
      cancelButtonTitle: '取消',
      takePhotoButtonTitle: '录制10秒视频',
      chooseFromLibraryButtonTitle: '选择已有视频',
      // quality:0.75,
      // allowsEditing:true,
      videoQuality: 'medium',
      mediaType: 'video',
      durationLimit: 10,
      noData: false,
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    };
    ImagePicker.showImagePicker(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      }
      const uri = response.uri;
      this.setState({
        previewVideo: uri,
      });
      // const signatureURL = config.api.base + config.api.signature;
      const accessToken = this.state.user.accessToken;
      this._getQiniuToken(accessToken, 'qiniu')
        .then((data) => {
          if (data && data.success) {
            // data.data
            const { token, key } = data.data;
            console.log(token, key);
            const body = new FormData();
            body.append('token', token);
            body.append('key', key);
            body.append('file', {
              type: 'video/mp4',
              uri: response.uri,
              name: key,
            });
            this._upload(body);
          }
        });
    });
  }
  _upload=(body) => {
    console.log(body);
    const xhr = new XMLHttpRequest();
    const url = config.qiniu.upload;
    this.setState({
      videoUploading: true,
      videoUploadingProgress: 0,
    });
    xhr.open('POST', url);
    xhr.onload = () => {
      if (xhr.status !== 200) {
        console.log(xhr);
        AlertIOS.alert('请求失败');
        return;
      }
      if (!xhr.responseText) {
        AlertIOS.alert('请求失败');
        return;
      }
      let response;
      try {
        response = JSON.parse(xhr.response);
      } catch (e) {
        console.log(e);
        console.log('parse fails');
      }
      if (response) {
        console.log('123');
        this.setState({
          videoUploading: false,
          videoUploaded: true,
          video: response,
          paused: true,
        });
        const vidoeURL = config.api.base + config.api.video;
        const accessToken = this.state.user.accessToken;
        request.post(vidoeURL, {
          accessToken,
          video: response,
        })
          .catch((err) => {
            console.log(err);
            AlertIOS.alert('视频同步出错，请重新上传1');
          })
          .then((data) => {
            if (!data || !data.success) {
              AlertIOS.alert('视频同步出错，请重新上传2');
            }
          });
      }
    };
    if (xhr.upload) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Number((event.loaded / event.total)).toFixed(2);
          this.setState({
            videoUploadingProgress: percent,
          });
        }
      };
    }
    xhr.send(body);
  }
  _getQiniuToken(accessToken, cloud) {
    const signatureURL = config.api.base + config.api.signature;
    return request.get(signatureURL, {
      cloud,
      accessToken,
      type: 'video',
    })
      .catch((err) => {
        console.log(err);
      });
  }
  _onLoadStart=() => {
    console.log('start');
  }
  _onLoad=() => {
    console.log('loading');
  }
  _onProgress=(data) => {
    console.log(data);
    const duration = data.playableDuration;
    const currentTime = data.currentTime;
    const percent = Number(currentTime / duration).toFixed(2);
    const newState = Object.assign({}, this.state, {
      videoTotal: duration,
      currentTime: Number(currentTime).toFixed(2),
      videoProgress: percent,
    });
    this.setState(newState);
    console.log('progress', data);
  }
  _onEnd=() => {
    if (this.state.recording) {
      this.setState({
        videoProgress: 1,
        recording: false,
        paused: true,
      });
    }

    console.log('end');
  }
  _onError=(err) => {
    console.log(`err:${err}`);
    this.setState({
      videooK: false,
    });
  }
  _record=() => {
    this.setState({
      videoProgress: 0,
      counting: false,
      recording: true,
      paused: false,
    });
    this.videoPlayer.seek(0);
  }
  _counting=() => {
    if (!this.state.counting && !this.state.recording) {
      this.setState({
        counting: true,
      });
      this.videoPlayer.seek(this.state.videoTotal - 0.01);
    }
  }
  render() {
    return (
      <View style={styles.container}>
        <View style={styles.toolbar}>
          <Text style={styles.toolbarTitle}>
            {
              this.state.previewVideo ? '点击按钮配音' : '视频配音'
            }
          </Text>
          {
            this.state.previewVideo && this.state.videoUploaded ?
              <Text onPress={this._pickVideo} style={styles.toolbarEdit}>
              更换视频
              </Text> :
              null
          }

        </View>
        <View style={styles.page}>
          {
            this.state.previewVideo ?
              <View style={styles.videoContainer}>
                <View style={styles.videoBox}>
                  <Video
                    ref={(c) => { this.videoPlayer = c; }}
                    source={{ uri: this.state.previewVideo }}
                    style={styles.video}
                    volume={5}
                    paused={this.state.paused} // 进来以后是否直接播放
                    rate={this.state.rate} // 是否暂停
                    muted={this.state.muted} // 静音
                    resizeMode={this.state.resizeMode}// 拉伸方式
                    repeat={this.state.repeat} // 重复播放
                    onLoadStart={this._onLoadStart} // 视频开始
                    onLoad={this._onLoad} // 播放中
                    onProgress={this._onProgress} // 每个250ms传个时间
                    onEnd={this._onEnd}
                    onError={this._onError}
                  />
                  {
                    !this.state.videoUploaded && this.state.videoUploading ?
                      <View style={styles.progressBox}>
                        <ProgressViewIOS
                          style={styles.progressBar}
                          progressTintColor={'#ee735c'}
                          progress={Number(this.state.videoUploadingProgress)}
                        />
                        <Text style={styles.progressTip}>
                      正在生成静音视频，已完成{(this.state.videoUploadingProgress * 100).toFixed(2)}%
                        </Text>
                      </View>
                      :
                      null
                  }
                  {
                    this.state.recording ?
                      <View style={styles.progressBox}>
                        <ProgressViewIOS
                          style={styles.progressBar}
                          progressTintColor={'#ee735c'}
                          progress={Number(this.state.videoProgress)}
                        />
                        <Text style={styles.progressTip}>
                      正在录制声音中，已完成{(this.state.videoProgress * 100).toFixed(2)}%
                        </Text>
                      </View> : null
                  }
                </View>
              </View> :
              <TouchableOpacity
                style={styles.uploadContainer}
                onPress={this._pickVideo}
              >
                <View style={styles.uploadBox}>
                  <Icon name="md-add" style={styles.uploadIcon} />
                  <Text style={styles.uploadTitle}>点击上传视频</Text>
                  <Text style={styles.uploadDesc}>建议时长不超过20秒</Text>
                </View>
              </TouchableOpacity>
          }
          {
            this.state.videoUploaded ?
              <View
                style={styles.recordBox}
              >
                <View style={[styles.recordIconBox, this.state.recording && styles.recordOn]}>
                  {
                    this.state.counting && !this.state.recording ?
                      <CountDownText
                        style={styles.countBtn}
                        countType="seconds" // 计时类型：seconds / date
                        auto // 自动开始
                        afterEnd={this._record} // 结束回调
                        timeLeft={4} // 正向计时 时间起点为0秒
                        step={-1} // 计时步长，以秒为单位，正数则为正计时，负数为倒计时
                        startText="开始录音" // 开始的文本
                        endText="Go" // 结束的文本
                        intervalText={sec => `${sec}`}
                      />
                      :
                      <TouchableOpacity
                        onPress={this._counting}
                      >
                        <Icon name="ios-microphone" style={styles.recordIcon} />
                      </TouchableOpacity>
                  }
                </View>
              </View>
              : null
          }

        </View>
      </View>
    );
  }
}
