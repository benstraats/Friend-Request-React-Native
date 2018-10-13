import React, { Component } from 'react';
import { StyleSheet, View, TextInput, ListView, ActivityIndicator, Text, Keyboard } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import SearchListItem from './SearchListItem'
import TopBar from './TopBar'
import {search} from './utils/APICalls'
import {COLORS, STRINGS} from './utils/ProjectConstants'

const styles = StyleSheet.create({
  container: {
   flex: 1,
   backgroundColor: COLORS.BACKGROUND_COLOR,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 5
  },
  searchTextBox: {
    flex: 99,
    paddingLeft: 5,
  },
  rowDeleteButton: {
    paddingRight: 5,
    color: COLORS.PRIMARY_COLOR
  },
})

export default class Search extends Component {
  constructor(props) {
    super(props);
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      searchText: '',
      userID: this.props.navigation.state.params.userID,
      accessToken: this.props.navigation.state.params.accessToken,
      listDataSource: [],
      dataSource: ds.cloneWithRows([]),
      searchSkip: 0,
      searchLimit: 50,
      fullyDoneSearch: true,
      currentlySearching: false,
      savedSearchText: '',
      doneASearch: false,
    };
  }

  startSearch = () => {
    Keyboard.dismiss();

    this.setState({
      listDataSource: [],
      searchSkip: 0,
      savedSearchText: this.state.searchText,
      fullyDoneSearch: false,
      currentlySearching: true,
      doneASearch: true,
    }, () => {
      this.setState({
        dataSource: this.state.dataSource.cloneWithRows(this.state.listDataSource),
      })
      this.apiSearch()
    })
  }

  apiSearch = () =>{
    var self = this;

    let onSuccess = (responseJson) => {
      if (responseJson === undefined) {
        this.apiSearch()
      }
      else if (responseJson.code === undefined || responseJson.code == 200) {
        let friends = [];

      if (responseJson.users.total <= this.state.searchSkip + this.state.searchLimit) {
        this.setState({
          fullyDoneSearch: true
        })
      }

      responseJson.users.data.forEach(function(obj) { 

        if (obj._id !== self.state.userID) {
          let row = [];
          row.push(obj._id)
          row.push(obj.name)
          row.push(obj.email)

          responseJson.friends.data.forEach(function(friend) {
            if (friend.user1 == obj._id || friend.user2 == obj._id) {
              row.push(STRINGS.FRIENDS_MESSAGE)
              row.push(friend._id)
            }
          })

          responseJson.requests.data.forEach(function(request) {
            if (request.requester == obj._id) {
              row.push(STRINGS.REQUESTEE_MESSAGE)
              row.push(request._id)
            } else if(request.requestee == obj._id) {
              row.push(STRINGS.REQUESTER_MESSAGE)
              row.push(request._id)
            }
          })

          if (row.length == 3) {
            row.push(STRINGS.NOT_FRIENDS_MESSAGE)
          }

          friends.push(row)
        }
      });

      this.setState({
        listDataSource: this.state.listDataSource.concat(friends),
      }, () => {
        this.setState({
          dataSource: this.state.dataSource.cloneWithRows(this.state.listDataSource),
          currentlySearching: false,
        })
      })
      }
      else {
        //response error
      }
    }

    let onFailure = (error) => {
      //fatal error
    }

    search(this.state.savedSearchText, this.state.searchLimit, this.state.searchSkip, onSuccess, onFailure)
  }

  fullyScrolled = () =>{
    if (!this.state.currentlySearching && !this.state.fullyDoneSearch) {
      this.setState({
        searchSkip: this.state.searchSkip + this.state.searchLimit,
        currentlySearching: true
      }, () => {
        this.apiSearch()
      })
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <TopBar mainText={STRINGS.SEARCH} navigation={this.props.navigation} />
        <View style={styles.rowContainer}>
          <TextInput
            style={styles.searchTextBox}
            placeholder={STRINGS.SEARCH}
            autoCapitalize='none'
            returnKeyType={"search"}
            onSubmitEditing={() => this.startSearch()}
            underlineColorAndroid={COLORS.PRIMARY_COLOR}
            maxLength={100}
            onChangeText={(text) => this.setState({searchText: text})}
          />
          {this.state.currentlySearching ? 
          <ActivityIndicator size="large" color={COLORS.PRIMARY_COLOR} /> :
          <Ionicons
            name={'md-search'}
            size={32}
            style={styles.rowDeleteButton}
            onIconClicked={() => this.startSearch()}
            onPress={() => this.startSearch()}
          />}
        </View>
        <View style={styles.container}>
        {(this.state.doneASearch && this.state.fullyDoneSearch && !this.state.currentlySearching && this.state.listDataSource.length === 0) ?
          <Text>{STRINGS.EMPTY_SEARCH}</Text> : 
          <ListView
            enableEmptySections={true}
            dataSource={this.state.dataSource}
            renderRow={
              (rowData) => <SearchListItem rowData={rowData} accessToken={this.state.accessToken}/>
            }
            onEndReached={() => this.fullyScrolled()}
          />}
        </View>
      </View>
    );
  }
}