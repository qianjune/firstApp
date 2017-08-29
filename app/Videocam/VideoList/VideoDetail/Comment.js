import React,{Component} from 'react'
import {
  ListView,
  Image,
  Text,
  View,
  StyleSheet,
  Dimensions,
  RefreshControl,
  ActivityIndicator
} from 'react-native'
import request from '../../../common/request'
import requestConfig from '../../../common/config'
const width = Dimensions.get('window').width
const cachedResults = {
  nextPage:1,
  items:[],
  total:0,
}

export default class Comment extends Component{
  state={
    isLoadingTail:false,
    refreshing:false,
    dataSource:new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2}).cloneWithRows([]),
  }
  componentDidMount(){
    this._fetchData(1)
  }
  _fetchData(page){
    console.log(page)
    if(page!==0){
      this.setState({
        isLoadingTail:true
      })
    }else{
      this.setState({
        refreshing:true
      })
    }

    request.get(requestConfig.api.base+requestConfig.api.comments,{
      accessToken:'abcd',
      page:page,
      creation:124
    })
      .then((data) => {
        if(data.success){
          let items=cachedResults.items
          if(page!==0){
            cachedResults.nextPage+=1
            items=items.concat(data.data)
          }else{
            console.log('上啦加载')
            items=data.data.concat(items)
          }

          cachedResults.items=items
          cachedResults.total=data.total
          setTimeout(()=>{
            if(page!==0){
              this.setState({
                isLoadingTail:false,
                dataSource:this.state.dataSource.cloneWithRows(cachedResults.items)
              })
            }else{
              this.setState({
                refreshing:false,
                dataSource:this.state.dataSource.cloneWithRows(cachedResults.items)
              })
            }

          },1000)
        }
      })
      .catch((error) => {
        if(page!==0){
          this.setState({
            isLoadingTail:false,
          })
        }else{
          this.setState({
            refreshing:false,
          })
        }
        console.error(error);
      });
  }
  _hasMore(){
    return cachedResults.items.length !== cachedResults.total
  }
  _fetchMoreData=()=>{
    if(!this._hasMore() || this.state.isLoadingTail){
      return
    }
    const page = cachedResults.nextPage
    this._fetchData()
  }
  _renderFooter=()=>{
    if(!this._hasMore()&&cachedResults.total!==0){
      return(
        <View style={styles.loadingMore}>
          <Text style={styles.loadingText}>
            没有更多视频
          </Text>
        </View>
      )
    }
    if(!this.state.isLoadingTail){
      return <View style={styles.loadingMore} />
    }
    return(
      <ActivityIndicator
        // animating={this.state.animating}
        style={styles.loadingMore}
        // size="large"
      />
    )
  }
  _onRefresh=()=>{
    console.log('我被下拉了')
    if(!this._hasMore()||this.state.refreshing){
      return
    }

    this._fetchData(0)
  }
  _renderRow=(row)=>{
    return(
      <View key={row._id} style={styles.replyBox}>
        <Image style={styles.replyAvatar} source={{uri:row.replyBy.avatar}} />
        <View style={styles.reply}>
          <Text style={styles.replyNickname}>{row.replyBy.nickname}</Text>
          <Text style={styles.replyContent}>{row.content}</Text>
        </View>
      </View>
    )
  }
  render(){
    return(
      <ListView
        showsVerticalScrollIndicator={false} //y轴滚动条
        enableEmptySections={true}
        dataSource={this.state.dataSource}
        automaticallyAdjustContentInsets={false}
        renderRow={(rowData) => this._renderRow(rowData)}
        onEndReachedThreshold={20}
        onEndReached={this._fetchMoreData}
        // renderHeader
        renderFooter={this._renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={this.state.refreshing}
            onRefresh={this._onRefresh}
            tintColor='#ff6600'
            title='拼命加载中。。。'
          />
        }
      />

    )
  }
}

const styles = StyleSheet.create({
  replyBox:{
    width:width,
    flexDirection:'row',
    justifyContent:'flex-start',
    marginTop:10,
  },
  replyAvatar:{
    width:40,
    height:40,
    marginLeft:10,
    marginRight:10,
    borderRadius:20,
  },
  reply:{
    flex:1
  },
  replyNickname:{
    color:'#666',
  },
  replyContent:{
    color:'#666',
    marginTop:4
  },
  loadingMore:{
    marginVertical:20 // setting both marginTop and marginBottom.
  },
  loadingText:{
    color:'#777',
    textAlign:'center'
  }
})
