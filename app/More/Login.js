'use strict';

import React, {Component} from 'react'
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  AlertIOS,
} from 'react-native'
import Button from 'react-native-button'
import request from '../common/request'
import config from '../common/config'
var {CountDownText} = require('react-native-sk-countdown');
export default class MoreExample extends Component{
  constructor(props) {
    super(props)
    this.state={
      phoneNumber:'',
      verifyCode:'',
      codeSent:false
    }
  }
  _submit=()=>{

  }
  _showVerifyCode(){
    this.setState({
      codeSent:true
    })
  }
  _sendVerifyCode=()=>{
    const {phoneNumber}=this.state
    if(!phoneNumber){
      return AlertIOS.alert('手机号不能为空')
    }
    const body={
      phoneNumber
    }
    const url = config.api.base+config.api.signup
    request.post(url,body)
      .then((data)=>{
        if(data&&data.success){
          this._showVerifyCode()
        }else{
          AlertIOS.alert('获取验证码失败，请检查手机号是否正确')
        }
      })
      .catch((err)=>{
        AlertIOS.alert('获取验证码失败，请检查网络是否良好')
      })
  }
  render(){
    return(
      <View style={styles.container}>
        <View style={styles.signupBox}>
          <Text style={styles.title}>快速登录</Text>
          <TextInput
             placeholder='输入手机号'
             autoCaptialize={'none'}
             autoCorrect={false}
             keyboardType={'number-pad'}
             style={styles.inputField}
             onChangeText={(text)=>{
               this.setState({
                 phoneNumber:text
               })
             }}
           />
           {
             this.state.codeSent
             ?
             <View style={styles.verifyCodeBox}>
               <TextInput
                  placeholder='输入验证码'
                  autoCaptialize={'none'}
                  autoCorrect={false}
                  keyboardType={'number-pad'}
                  style={styles.inputField}
                  onChangeText={(text)=>{
                    this.setState({
                      verifyCode:text
                    })
                  }}
                />
                {/* <CountDownText
                  style={styles.cd}
                  countType='seconds' // 计时类型：seconds / date
                  auto={true} // 自动开始
                  afterEnd={() => {}} // 结束回调
                  timeLeft={10} // 正向计时 时间起点为0秒
                  step={-1} // 计时步长，以秒为单位，正数则为正计时，负数为倒计时
                  startText='获取验证码' // 开始的文本
                  endText='获取验证码' // 结束的文本
                  intervalText={(sec) => sec + '秒重新获取'} // 定时的文本回调
                /> */}
             </View>
             :null
           }
             {
               this.state.codeSent?
               <Button style={styles.btn}
                 onPress={this._submit}>登录</Button>:
                 <Button style={styles.btn}
                   onPress={this._sendVerifyCode}>获取验证码</Button>
             }
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container:{
    flex:1,
    padding:10,
    paddingTop:10,
    backgroundColor:'#f9f9f9'
  },
  signupBox:{
    marginTop:30,
  },
  title:{
    marginBottom:20,
    color:'#333',
    fontSize:20,
    textAlign:'center'
  },
  inputField:{
    // flex:1,
    height:40,
    padding:5,
    color:'#666',
    fontSize:16,
    backgroundColor:'#fff',
    borderRadius:4
  },
  btn:{
    marginTop:10,
    padding:10,
    backgroundColor:'transparent',
    borderColor:'#ee735c',
    borderWidth:1,
    borderRadius:4,
    color:'#ee735c'
  }
})
