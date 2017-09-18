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
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import ImagePicker from 'react-native-image-picker';
import { CountDownText } from 'react-native-sk-countdown';
import Video from 'react-native-video';
import * as Progress from 'react-native-progress';
import { AudioRecorder, AudioUtils } from 'react-native-audio';
import Sound from 'react-native-sound';
import _ from 'lodash';
import request from '../common/request';
import config from '../common/config';


const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  uploadAudioBox: {
    width,
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadAudioText: {
    width: width - 20,
    borderWidth: 1,
    padding: 5,
    borderColor: '#ee735c',
    borderRadius: 5,
    textAlign: 'center',
    fontSize: 30,
    color: '#ee735c',
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
  previewBox: {
    width: 80,
    height: 30,
    position: 'absolute',
    right: 10,
    bottom: 10,
    borderWidth: 1,
    borderColor: '#ee735c',
    borderRadius: 3,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  previewIcon: {
    marginRight: 5,
    fontSize: 20,
    color: '#ee735c',
  },
  previewText: {
    fontSize: 20,
    color: '#ee735c',
  },
});
const CLOUDINARY = {
  cloud_name: 'qjune',
  api_key: '586975228138865',
  api_secret: 'GGvaj8rTxuMDuhGube06Cj3pFoA',
  base: 'http://res.cloudinary.com/qjune',
  image: 'https://api.cloudinary.com/v1_1/qjune/image/upload',
  video: 'https://api.cloudinary.com/v1_1/qjune/video/upload',
  audio: 'https://api.cloudinary.com/v1_1/qjune/raw/upload',
};
const initState = {
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

  // audio
  audioPath: `${AudioUtils.DocumentDirectoryPath}/test.aac`,
  audioPlaying: false,
  recordDone: false,
  audioUploadProgress: 0,
  audio: null,
};
export default class RecordingExample extends Component {
  constructor(props) {
    super(props);
    const myState = _.clone(initState);
    this.state = myState;
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
    this._initAudio();
  }
  prepareRecordingPath(audioPath) {
    AudioRecorder.prepareRecordingAtPath(audioPath, {
      SampleRate: 22050,
      Channels: 1,
      AudioQuality: 'High',
      AudioEncoding: 'aac',
      AudioEncodingBitRate: 32000,
    });
  }
  async _play() {
    if (this.state.recording) {
      await this._stop();
    }

    // These timeouts are a hacky workaround for some issues with react-native-sound.
    // See https://github.com/zmxv/react-native-sound/issues/89.
    setTimeout(() => {
      const sound = new Sound(this.state.audioPath, '', (error) => {
        if (error) {
          console.log('failed to load the sound', error);
        }
      });

      setTimeout(() => {
        sound.play((success) => {
          if (success) {
            console.log('successfully finished playing');
          } else {
            console.log('playback failed due to audio decoding errors');
          }
        });
      }, 100);
    }, 100);
  }
  _preview=() => {
    if (this.state.audioPlaying) {
      // AudioRecorder.stopPlaying();
    }
    this.setState({
      videoProgress: 0,
      audioPlaying: true,
      paused: false,
    });
    this._play();
    this.videoPlayer.seek(0);
  }
  _uploadAudio=() => {
    const tags = 'app,audio';
    const folder = 'audio';
    const timestamp = Date.now();
    this._getUploadToken({
      type: 'audio',
      cloud: 'cloudinary',
      timestamp,
    })
      .then((data) => {
        if (data && data.success) {
        // data.data
          const { token, key } = data.data;
          const body = new FormData();

          body.append('folder', folder);
          body.append('tags', tags);
          body.append('signature', token);
          body.append('api_key', CLOUDINARY.api_key);
          body.append('resource_type', 'video');
          body.append('file', {
            type: 'video/mp4',
            uri: this.state.audioPath,
            name: key,
          });
          body.append('timestamp', timestamp);
          this._upload(body, 'audio');
        }
      });
  }
  _initAudio=() => {
    this.prepareRecordingPath(this.state.audioPath);
    AudioRecorder.onProgress = (data) => {
      this.setState({ currentTime: Math.floor(data.currentTime) });
    };

    AudioRecorder.onFinished = (data) => {
      // Android callback comes in the form of a promise instead.
      if (Platform.OS === 'ios') {
        // this._finishRecording(data.status === 'OK', data.audioFileURL);
      }
    };
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
      const myState = _.clone(initState);
      myState.previewVideo = uri;

      this.setState(myState);
      // const signatureURL = config.api.base + config.api.signature;

      this._getUploadToken({ cloud: 'qiniu', type: 'video' })
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
            this._upload(body, 'video');
          }
        });
    });
  }
  _upload=(body, type) => {
    console.log(body);
    const xhr = new XMLHttpRequest();
    let url = config.qiniu.upload;
    if (type === 'audio') {
      url = CLOUDINARY.video;
    }
    const state = {};
    state[`${type}UploadingProgress`] = 0;
    state[`${type}Uploading`] = true;
    state[`${type}Uploaded`] = false;
    this.setState(state);
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
        const newState = {};
        newState[`${type}UploadingProgress`] = 1;
        newState[`${type}Uploading`] = false;
        newState[`${type}Uploaded`] = true;
        newState[type] = response;
        newState.paused = true;
        this.setState(newState);
        if (type === 'video') {
          const updateURL = config.api.base + config.api[type];
          const accessToken = this.state.user.accessToken;
          const uploadBody = {
            accessToken,
          };
          uploadBody[type] = response;
          request.post(updateURL, uploadBody)
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
      }
    };
    if (xhr.upload) {
      console.log('正在上传');
      xhr.upload.onprogress = (event) => {
        console.log('上传进度');
        if (event.lengthComputable) {
          const percent = Number((event.loaded / event.total)).toFixed(2);
          console.log('上传进度', percent, type);
          const progressState = {};
          progressState[`${type}UploadingProgress`] = Number(percent);
          console.log(progressState);
          this.setState(progressState);
        }
      };
    }
    xhr.send(body);
  }
  _getUploadToken(body) {
    // const { accessToken, cloud, type } = body;
    const accessToken = this.state.user.accessToken;
    const signatureURL = config.api.base + config.api.signature;
    body.accessToken = accessToken;
    return request.get(signatureURL, body)
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
      AudioRecorder.stopRecording();
      this.setState({
        recordDone: true,
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
      recordDone: false,
    });
    AudioRecorder.startRecording();
    this.videoPlayer.seek(0);
  }
  _counting=() => {
    if (!this.state.counting && !this.state.recording && !this.state.audioPlaying) {
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
                    this.state.recording || this.state.audioPlaying ?
                      <View style={styles.progressBox}>
                        <ProgressViewIOS
                          style={styles.progressBar}
                          progressTintColor={'#ee735c'}
                          progress={Number(this.state.videoProgress)}
                        />
                        {
                          this.state.recording ?
                            <Text style={styles.progressTip}>
                        正在录制声音中，已完成{(this.state.videoProgress * 100).toFixed(2)}%
                            </Text> : null
                        }

                      </View> : null
                  }
                  {
                    this.state.recordDone ?
                      <View style={styles.previewBox}>
                        <Icon name={'ios-play'} style={styles.previewIcon} />
                        <Text onPress={this._preview} style={styles.previewText}>预览</Text>
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
                <View style={[styles.recordIconBox,
                  (this.state.recording || this.state.audioPlaying) && styles.recordOn]}
                >
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
          {
            this.state.videoUploaded && this.state.recordDone ?
              <View style={styles.uploadAudioBox}>
                {
                  !this.state.audioUploaded && !this.state.audioUploading ?
                    <Text
                      onPress={this._uploadAudio}
                      style={styles.uploadAudioText}
                    >下一步</Text> : null
                }
                {
                  this.state.audioUploading ?
                    <Progress.Circle
                      showsText
                      size={60}
                      color={'#ee735c'}
                      progress={this.state.audioUploadingProgress}
                    /> : null
                }
              </View> : null
          }
        </View>
      </View>
    );
  }
}
