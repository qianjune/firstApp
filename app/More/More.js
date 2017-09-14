

import React, { Component } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  AsyncStorage,
  ImageBackground,
  AlertIOS,
  Modal,
} from 'react-native';
import Button from 'react-native-button';

import Icon from 'react-native-vector-icons/Ionicons';
import sha1 from 'sha1';
import * as Progress from 'react-native-progress';
import request from '../common/request';
import config from '../common/config';
import ImagePicker from 'react-native-image-picker';

const width = Dimensions.get('window').width;

const CLOUDINARY = {
  cloud_name: 'qjune',
  api_key: '586975228138865',
  api_secret: 'GGvaj8rTxuMDuhGube06Cj3pFoA',
  base: 'http://res.cloudinary.com/qjune',
  image: 'https://api.cloudinary.com/v1_1/qjune/image/upload',
  video: 'https://api.cloudinary.com/v1_1/qjune/video/upload',
  audio: 'https://api.cloudinary.com/v1_1/qjune/raw/upload',
};
function avatar(id, type) {
  if (id.indexOf('http') > -1) {
    return id;
  }
  if (id.indexOf('data:image') > -1) {
    return id;
  }
  if (id.indexOf('avatar/') > -1) {
    return `${CLOUDINARY.base}/${type}/upload/${id}`;
  }
  return `http://ovtw0gn3p.bkt.clouddn.com/${id}`;
}
export default class MoreExample extends Component {
  constructor(props) {
    super(props);
    this.state = {

    };
  }
  componentWillMount() {
    const user = this.state.user || {};
    this.setState({
      user,
      avatarProgress: 0,
      avatarUploading: false,
      modalVisible: false,
    });
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

  _getQiniuToken(accessToken, cloud) {
    const signatureURL = config.api.base + config.api.signature;
    return request.get(signatureURL, {
      cloud,
      accessToken,
      type: 'avatar',
    })
      .catch((e) => {
        console.log(err);
      });
  }
  _uploadCloydinary=(body) => {
    const { accessToken } = body;
    const timestamp = Date.now();
    request.get(signatureURL, {
      accessToken,
      timestamp,
      type: 'avatar',
    })
      .then((data) => {
        if (data && data.success) {
          // data.data
          const signature = data.data;
          // console.log(signature);
          // signature = sha1(signature)
          // console.log(signature);
          const body = new FormData();

          body.append('folder', folder);
          body.append('tags', tags);
          body.append('signature', signature);
          body.append('api_key', CLOUDINARY.api_key);
          body.append('resource_type', 'image');
          body.append('file', avatarData);
          body.append('timestamp', timestamp);
          this._upload(body);
        }
      });
  }
  _pickPhoto=() => {
    const options = {
      title: '选择头像',
      cancelButtonTitle: '取消',
      takePhotoButtonTitle: '拍照',
      chooseFromLibraryButtonTitle: '选择相册',
      quality: 0.75,
      allowsEditing: true,
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
      console.log('Response = ', response);
      const avatarData = `data:image/jpeg;base64,${response.data}`;
      // const user =this.state.user
      // user.avatar=avatarData
      // this.setState({
      //   user
      // })

      const signatureURL = config.api.base + config.api.signature;
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
              type: 'image/png',
              uri: response.uri,
              name: key,
            });
            console.log(body);
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
      avatarUploading: true,
      avatarProgress: 0,
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
      if (response && (response.public_id || response.key)) {
        console.log(response);
        const user = this.state.user;
        user.avatar = response.public_id || response.key;
        this.setState({
          avatarUploading: false,
          avatarProgress: 0,
          user,
        });
        this._asyncUser(true);
      }
    };
    if (xhr.upload) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Number((event.loaded / event.total).toFixed(2));
          this.setState({
            avatarProgress: percent,
          });
        }
      };
    }
    xhr.send(body);
  }
  _asyncUser=(isAvatar) => {
    const user = this.state.user;
    console.log(user);
    if (user && user.accessToken) {
      const url = config.api.base + config.api.update;
      console.log(url, user);
      request.post(url, user)
        .then((data) => {
          if (data && data.success) {
            const user = data.data;
            if (isAvatar) {
              AlertIOS.alert('头像更新成功');
            }
            this.setState({
              user,
            }, () => {
              this._closeModal();
              AsyncStorage.setItem('user', JSON.stringify(user));
            });
          }
        });
    }
  }
  _edit=() => {
    this.setState({
      modalVisible: true,
    });
  }
  _closeModal=() => {
    this.setState({
      modalVisible: false,
    });
  }
  _changeUserState=(key, value) => {
    const user = this.state.user;
    console.log(key, value);
    user[key] = value;
    this.setState({ user });
  }
  _submit=() => {
    this._asyncUser();
  }
  _logout=() => {
    this.props.logout();
  }
  render() {
    const { user, avatarProgress } = this.state;
    console.log(user);
    return (
      <View style={styles.container}>
        <View style={styles.toolbar}>
          <Text style={styles.toolbarTitle}>
            我的账户
          </Text>
          <Text onPress={this._edit} style={styles.toolbarEdit}>
            编辑
          </Text>
        </View>
        {
          user.avatar ?
            <TouchableOpacity onPress={this._pickPhoto} style={styles.avatarContainer}>
              <ImageBackground source={{ uri: avatar(user.avatar, 'image') }} style={styles.avatarContainer}>
                <View style={styles.avatarBox}>
                  {
                    this.state.avatarUploading ?
                      <Progress.Circle
                        showsText
                        size={75}
                        color={'#ee735c'}
                        progress={avatarProgress}
                      />
                      :
                      <Image source={{ uri: avatar(user.avatar, 'image') }} style={styles.avatar} />
                  }

                </View>
                <Text style={styles.avatarTip}>
                戳这里换头像
                </Text>
              </ImageBackground>
            </TouchableOpacity>
            :
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarTip}>
              添加头像
              </Text>
              <TouchableOpacity onPress={this._pickPhoto} style={styles.avatarBox}>
                {
                  this.state.avatarUploading ?
                    <Progress.Circle
                      showsText
                      size={75}
                      color={'#ee735c'}
                      progress={avatarProgress}
                    />
                    :
                    <Icon name="md-add" style={styles.plusIcon} />
                }
              </TouchableOpacity>
            </View>
        }
        <Modal
          animationType={'fade'}
          visible={this.state.modalVisible}
        >
          <View style={styles.modalContainer}>
            <Icon name="ios-close-outline" style={styles.closeIcon} onPress={this._closeModal} />
            <View style={styles.fieldItem}>
              <Text style={styles.label}>昵称</Text>
              <TextInput
                placeholder="输入你的昵称"
                style={styles.inputField}
                autoCaptialize={'none'}
                autoCorrect={false}
                defaultValue={user.nickName}
                onChangeText={(text) => { this._changeUserState('nick', text); }}
              />
            </View>
            <View style={styles.fieldItem}>
              <Text style={styles.label}>职业</Text>
              <TextInput
                placeholder="输入你职业"
                style={styles.inputField}
                autoCaptialize={'none'}
                autoCorrect={false}
                defaultValue={user.occupation}
                onChangeText={(text) => { this._changeUserState('occupation', text); }}
              />
            </View>
            <View style={styles.fieldItem}>
              <Text style={styles.label}>年龄</Text>
              <TextInput
                placeholder="输入你年龄"
                style={styles.inputField}
                autoCaptialize={'none'}
                autoCorrect={false}
                defaultValue={user.age}
                onChangeText={(text) => { this._changeUserState('age', text); }}
              />
            </View>
            <View style={styles.fieldItem}>
              <Text style={styles.label}>性别</Text>
              <Icon.Button
                name="ios-male"
                onPress={() => {
                  this._changeUserState('gender', 'male');
                }}
                style={[styles.gender, user.gender === 'male' && styles.genderChecked]}
              >男</Icon.Button>
              <Icon.Button
                name="ios-female"
                onPress={() => {
                  this._changeUserState('gender', 'female');
                }}
                style={[styles.gender, user.gender === 'female' && styles.genderChecked]}
              >女</Icon.Button>
            </View>
            <Button
              style={styles.btn}
              onPress={this._submit}
            >保存</Button>
          </View>
        </Modal>
        <Button
          style={styles.btn}
          onPress={this._logout}
        >登出</Button>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // alignItems:'center',
    // justifyContent:'center'
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
  avatarContainer: {
    width,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eee',
  },
  avatarBox: {
    marginTop: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusIcon: {
    padding: 20,
    paddingLeft: 25,
    paddingRight: 25,
    color: '#999',
    fontSize: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  avatarTip: {
    color: '#fff',
    backgroundColor: 'transparent',
    fontSize: 14,
  },
  avatar: {
    marginBottom: 15,
    width: width * 0.2,
    height: width * 0.2,
    resizeMode: 'cover',
    borderRadius: width * 0.1,
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
  modalContainer: {
    flex: 1,
    paddingTop: 50,
    backgroundColor: '#fff',
  },
  fieldItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 50,
    paddingLeft: 15,
    paddingRight: 15,
    borderColor: '#eee',
    borderBottomWidth: 1,
  },
  label: {
    color: '#ccc',
    marginRight: 10,
  },
  inputField: {
    height: 50,
    flex: 1,
    color: '#666',
    fontSize: 14,
  },
  closeIcon: {
    position: 'absolute',
    width: 40,
    height: 40,
    fontSize: 32,
    right: 20,
    top: 30,
    color: '#ee735c',

  },
  gender: {
    backgroundColor: '#ccc',
  },
  genderChecked: {
    backgroundColor: '#ee735c',
  },
  btn: {
    marginLeft: 10,
    marginRight: 10,
    marginTop: 25,
    padding: 10,
    backgroundColor: 'transparent',
    borderColor: '#ee735c',
    borderWidth: 1,
    borderRadius: 4,
    color: '#ee735c',
  },
});
