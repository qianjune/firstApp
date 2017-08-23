import React,{Component} from 'react'
import {
  ListView,
  Text,
  TouchableHighlight,
  Image,
  ImageBackground,
  StyleSheet,
  View,
  ActivityIndicator,
  RefreshControl
} from 'react-native'
import Mock from 'mockjs'
import mockData from './config'
import Video from './Video'
import request from '../../common/request'
import requestConfig from '../../common/config'


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
      <Video navigator={this.props.navigator} rowData={rowData} />
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

})
