import React,{Component} from 'react'
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
  RefreshControl
} from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'
import Mock from 'mockjs'
import mockData from './config'
import request from '../../common/request'
import requestConfig from '../../common/config'

const width = Dimensions.get('window').width

const cachedResults = {
  nextPage:1,
  items:[],
  total:0,
}

export default class VideoList extends Component{
  state={
    isLoadingTail:false,
    refreshing:false
  }
  componentWillMount(){
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    const state = {
        dataSource: ds.cloneWithRows([]),
      };
      this.setState(
        state
      )
  }
  componentDidMount(){
    this._fetchData(1)
  }
  renderRow(rowData){
    return(
      <TouchableHighlight>
        <View style={styles.item}>
          <Text style={styles.title}>
            {rowData.title}
          </Text>
          <ImageBackground
            source={{uri:rowData.thumb}}
            style={styles.thumb}
          >
            <Icon name='ios-play' size={28} style={styles.play}/>
          </ImageBackground>
          <View style={styles.itemFooter}>
            <View style={styles.handleBox}>
              <Icon name='ios-heart-outline' size={28} style={styles.up}/>
              <Text style={styles.handleText}>喜欢</Text>
            </View>
            <View style={styles.handleBox}>
              <Icon name='ios-chatbubbles-outline' size={28}
                style={styles.commentIcon}/>
              <Text style={styles.handleText}>评价</Text>
            </View>
          </View>
        </View>
      </TouchableHighlight>
    )
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

    request.get(requestConfig.api.base+requestConfig.api.creations,{
      accessToken:'abcd',
      page:page,
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
  render(){
    return(
      <ListView
        showsVerticalScrollIndicator={false} //y轴滚动条
        enableEmptySections={true}
        onEndReachedThreshold={20}
        onEndReached={this._fetchMoreData}
        renderFooter={this._renderFooter}
        dataSource={this.state.dataSource}
        automaticallyAdjustContentInsets={false}
        renderRow={(rowData) => this.renderRow(rowData)}
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
  item:{
    width:width,
    marginBottom:10,
    backgroundColor:'#fff'
  },
  title:{
    padding:10,
    fontSize:18,
    color:'#333'
  },
  thumb:{
    width:width,
    height:width*0.56,
    // resizeMode:'cover'
  },
  itemFooter:{
    flexDirection:'row',
    justifyContent:'space-between',
    backgroundColor:'#eee'
  },
  handleBox:{
    padding:10,
    flexDirection:'row',
    width:width/2-0.5,
    justifyContent:'center',
    backgroundColor:'#fff',
    alignItems:'center'
  },
  play:{
    position:'absolute',
    bottom:14,
    right:14,
    width:46,
    height:46,
    paddingTop:9,
    paddingLeft:18,
    backgroundColor:'transparent',
    borderColor:'#fff',
    borderWidth:1,
    borderRadius:23,
    color:'#ed7b66'
  },
  up:{
    fontSize:22,
    color:'#333'
  },
  handleText:{
    paddingLeft:12,
    fontSize:18,
    color:'#333'
  },
  commentIcon:{
    fontSize:22,
    color:'#333'
  },
  loadingMore:{
    marginVertical:20 // setting both marginTop and marginBottom.
  },
  loadingText:{
    color:'#777',
    textAlign:'center'
  }
})
