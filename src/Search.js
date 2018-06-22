import React, { Component } from 'react';
import { Alert, Button, StyleSheet, View, TextInput, ListView, ActivityIndicator } from 'react-native';
import SearchListItem from './SearchListItem'
import StatusBarOffset from './StatusBarOffset'
import {search} from './utils/APICalls'

const styles = StyleSheet.create({
  container: {
   flex: 1,
   backgroundColor: '#fff',
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  searchTextBox: {
    flex: 99,
  },
  serachButton: {
    flex: 1,
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
    };
  }

  startSearch = () => {
    this.setState({
      listDataSource: [],
      searchSkip: 0,
      savedSearchText: this.state.searchText,
      fullyDoneSearch: false,
      currentlySearching: true,
    }, () => {
      this.setState({
        dataSource: this.state.dataSource.cloneWithRows(this.state.listDataSource),
      })
      this.apiSearch()
    })
  }

  apiSearch = () =>{

    let onSuccess = (responseJson) => {
      if (responseJson !== undefined) {
        if (responseJson.code === undefined || responseJson.code == 200) {
          let friends = [];

          if (responseJson.users.data.length < this.state.searchLimit || responseJson.users.data.limit === this.state.searchLimit + this.state.searchLimit) {
            this.setState({
              fullyDoneSearch: true
            })
          }

          responseJson.users.data.forEach(function(obj) { 
            let row = [];
            row.push(obj._id)
            row.push(obj.name)
            row.push(obj.email)

            responseJson.friends.data.forEach(function(friend) {
              if (friend.user1 == obj._id || friend.user2 == obj._id) {
                row.push('Friends')
                row.push(friend._id)
              }
            })

            responseJson.requests.data.forEach(function(request) {
              if (request.requester == obj._id) {
                row.push('Accept Request')
                row.push(request._id)
              } else if(request.requestee == obj._id) {
                row.push('Cancel Request')
                row.push(request._id)
              }
            })

            if (row.length == 3) {
              row.push('Add User')
            }

            friends.push(row)
          });

          this.setState({
            listDataSource: this.state.listDataSource.concat(friends),
          }, () => {
            this.setState({
              dataSource: this.state.dataSource.cloneWithRows(this.state.listDataSource),
              currentlySearching: false
            })
          })
        }
        else {
          Alert.alert('Failed to search', '' + JSON.stringify(responseJson))
        }
      }
    }

    let onFailure = (error) => {
      Alert.alert('No Internet Connection')
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
        <StatusBarOffset />
        <View style={styles.rowContainer}>
          <TextInput
            style={styles.searchTextBox}
            placeholder="Search"
            autoCapitalize='none'
            returnKeyType={"search"}
            onSubmitEditing={this.startSearch}
            underlineColorAndroid={'#ffb028'}
            maxLength={100}
            onChangeText={(text) => this.setState({searchText: text})}
          />
          {this.state.currentlySearching ? 
          <ActivityIndicator size="large" color="#ffb028" /> :
          <Button
            style={styles.searchButton}
            onPress={this.startSearch}
            title={"Search"}
            color="#ffb028"
          />}
        </View>
        <View style={styles.container}>
          <ListView
            enableEmptySections={true}
            dataSource={this.state.dataSource}
            renderRow={
              (rowData) => <SearchListItem rowData={rowData} accessToken={this.state.accessToken}/>
            }
            onEndReached={this.fullyScrolled()}
          />
        </View>
      </View>
    );
  }
}