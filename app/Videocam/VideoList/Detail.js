'use strict';

import React, {Component} from 'react'
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native'
// import  MyVideo from 'react-native-video'
// const Video = MyVideo.default
import Video from 'react-native-video'
const width = Dimensions.get('window').width

export default class RecordingExample extends Component{
  state={
    data:this.props.data,
    rate:1,
    muted:true,
    resizeMode:'contain',
    repeat:false
  }
  _onLoadStart=()=>{
    console.log('start');
  }
  _onLoad=()=>{
    console.log('loading');
  }
  _onProgress=(data)=>{
    console.log('progress'+data);
  }
  _onEnd=()=>{
    console.log('end');
  }
  _onError=(err)=>{
    console.log('err:'+err);
  }
  render(){
    const {data}=this.state
    return(
      <View style={styles.container}>
        <Text>
          我是视频{data._id}详情
        </Text>
        <View style={styles.videoBox}>
          <Video
            ref='videoPlayer'
            source={{uri:"https://devimages.apple.com.edgekey.net/streaming/examples/bipbop_4x3/bipbop_4x3_variant.m3u8"}}
            style={styles.video}
            volume={5}
            paused={false}         //进来以后是否直接播放
            rate={this.state.rate} //是否暂停
            muted={this.state.muted}     //静音
            resizeMode={this.state.resizeMode}//拉伸方式
            repeat={this.state.repeat}  //重复播放
            onLoadStart={this._onLoadStart} //视频开始
            onLoad={this._onLoad} //播放中
            onProgress={this._onProgress} //每个250ms传个时间
            onEnd={this._onEnd}
            onError={this._onError}
          />
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container:{
    flex:1,
    alignItems:'center',
    justifyContent:'center'
  },
  videoBox:{
    width:width,
    height:360,
    backgroundColor:'#000'
  },
  video:{
    width:width,
    height:360,
    backgroundColor:'#000'
  }
})
