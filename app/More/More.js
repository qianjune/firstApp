'use strict';

import React, {Component} from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  AsyncStorage,
  ImageBackground,
  AlertIOS
} from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'
import sha1 from 'sha1'
import * as Progress from 'react-native-progress';
import request from '../common/request'
import config from '../common/config'
import ImagePicker from 'react-native-image-picker'
const width = Dimensions.get('window').width

const CLOUDINARY = {
  'cloud_name': 'qjune',
  'api_key': '586975228138865',
  'api_secret': 'GGvaj8rTxuMDuhGube06Cj3pFoA',
  base:'http://res.cloudinary.com/qjune',
  image:'https://api.cloudinary.com/v1_1/qjune/image/upload',
  video:'https://api.cloudinary.com/v1_1/qjune/video/upload',
  audio:'https://api.cloudinary.com/v1_1/qjune/raw/upload',
}
function avatar(id,type){
  if(id.indexOf('http')>-1){
    return id
  }
  if(id.indexOf('data:image')>-1){
    return id
  }
  return CLOUDINARY.base+'/'+type+'/upload/'+id
}
export default class MoreExample extends Component{
  constructor(props) {
    super(props)
    this.state={

    }
  }
  componentWillMount(){
    const user = this.state.user || {}
    this.setState({
      user,
      avatarProgress:0,
      avatarUploading:false
    })
  }
  componentDidMount(){
    AsyncStorage.getItem('user')
      .then((data)=>{
        let user
        if(data){
         user = JSON.parse(data)
        }
        if(user&&user.accessToken){
          this.setState({
            user
          })
        }
      })
  }
  _pickPhoto=()=>{
    var options = {
      title: '选择头像',
      cancelButtonTitle:'取消',
      takePhotoButtonTitle:'拍照',
      chooseFromLibraryButtonTitle:'选择相册',
      quality:0.75,
      allowsEditing:true,
      noData:false,
      storageOptions: {
        skipBackup: true,
        path: 'images'
      }
    };
    ImagePicker.showImagePicker(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      }
      console.log('Response = ', response);
      const avatarData = 'data:image/jpeg;base64,' + response.data
      // const user =this.state.user
      // user.avatar=avatarData
      // this.setState({
      //   user
      // })

      const timestamp=Date.now()
      const tags = 'app,avatar'
      const folder = 'avatar'
      const signatureURL = config.api.base+config.api.signature
      const accessToken=this.state.user.accessToken
      request.get(signatureURL,{
        accessToken,
        timestamp,
        folder,
        tags,
        type:'avatar'
      }).
        then((data)=>{
          if(data&&data.success){
            //data.data
            let signature=`folder=${folder}&tags=${tags}&timestamp=${timestamp}${CLOUDINARY.api_secret}`
            console.log(signature);
            signature = sha1(signature)
            console.log(signature);
            const body = new FormData()

            body.append('folder',folder)
            body.append('tags',tags)
            body.append('signature',signature)
            body.append('api_key',CLOUDINARY.api_key)
            body.append('resource_type','image')
            body.append('file',avatarData)
            body.append('timestamp',timestamp)
            this._upload(body)
          }
        })
    });
  }
  _upload=(body)=>{
    console.log(body);
    const xhr = new XMLHttpRequest()
    const url = CLOUDINARY.image
    this.setState({
      avatarUploading:true,
      avatarProgress:0
    })
    xhr.open('POST',url)
    xhr.onload = ()=>{

      if(xhr.status!==200){
        AlertIOS.alert('请求失败')
        return
      }
      if(!xhr.responseText){
        AlertIOS.alert('请求失败')
        return
      }
      let response
      try{
        response=JSON.parse(xhr.response)
      }
      catch(e){
        console.log(e);
        console.log('parse fails');
      }
      if(response&&response.public_id){
        const user = this.state.user
        user.avatar=response.public_id
        this.setState({
          avatarUploading:false,
          avatarProgress:0,
          user
        })
        this._asyncUser(true)
      }
    }
    if(xhr.upload){
      xhr.upload.onprogress=(event)=>{

        if(event.lengthComputable){
          const percent =Number((event.loaded / event.total).toFixed(2))
          this.setState({
            avatarProgress:percent
          })
        }
      }
    }
    xhr.send(body)
  }
  _asyncUser=(isAvatar)=>{
    const user=this.state.user
    console.log(user);
    if(user&&user.accessToken){
      const url=config.api.base+config.api.update
      console.log(url,user);
      request.post(url,user)
        .then((data)=>{
          if(data&&data.success){
            const user=data.data
            if(isAvatar){
              AlertIOS.alert('头像更新成功')
            }
            this.setState({
              user
            },()=>{
              AsyncStorage.setItem('user',JSON.stringify(user))
            })
          }
        })
    }
  }
  render(){
    const {user,avatarProgress} = this.state
    console.log(avatarProgress);
    return(
      <View style={styles.container}>
        <View style={styles.toolbar}>
          <Text style={styles.toolbarTitle}>
            我的账户
          </Text>

        </View>
        {
          user.avatar?
          <TouchableOpacity onPress={this._pickPhoto} style={styles.avatarContainer}>
            <ImageBackground source={{uri:avatar(user.avatar,'image')}} style={styles.avatarContainer}>
              <View style={styles.avatarBox}>
                {
                  this.state.avatarUploading?
                  <Progress.Circle
                    showsText={true}
                    size={75}
                    color={'#ee735c'}
                   progress={avatarProgress}
                      // indeterminate={true}
                     />
                  :
                    <Image source={{uri:avatar(user.avatar,'image')}} style={styles.avatar} />
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
                this.state.avatarUploading?
                <Progress.Circle
                  showsText={true}
                  size={75}
                  color={'#ee735c'}
                 progress={avatarProgress}
                    // indeterminate={true}
                   />
                :
                <Icon name='md-add' style={styles.plusIcon}  />
              }
            </TouchableOpacity>
          </View>
        }
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container:{
    flex:1,
    // alignItems:'center',
    // justifyContent:'center'
  },
  toolbar:{
    flexDirection:'row',
    paddingTop:25,
    paddingBottom:12,
    backgroundColor:'#ee735c'
  },
  toolbarTitle:{
    flex:1,
    fontSize:16,
    color:'#fff',
    textAlign:'center',
    fontWeight:'600'
  },
  avatarContainer:{
    width:width,
    height:140,
    alignItems:'center',
    justifyContent:'center',
    backgroundColor:'#eee'
  },
  avatarBox:{
    marginTop:15,
    alignItems:'center',
    justifyContent:'center'
  },
  plusIcon:{
    padding:20,
    paddingLeft:25,
    paddingRight:25,
    color:'#999',
    fontSize:20,
    backgroundColor:'#fff',
    borderRadius:8
  },
  avatarTip:{
    color:'#fff',
    backgroundColor:'transparent',
    fontSize:14
  },
  avatar:{
    marginBottom:15,
    width:width*0.2,
    height:width*0.2,
    resizeMode:'cover',
    borderRadius:width*0.1
  }
})
