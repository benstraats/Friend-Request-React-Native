import React, { Component } from 'react';
import { Alert, AppRegistry, Button, StyleSheet, View, Image, Text, TextInput, ListView } from 'react-native';
import { createBottomTabNavigator } from 'react-navigation';
import SearchListItem from './SearchListItem'

const styles = StyleSheet.create({
  container: {
   flex: 1,
   justifyContent: 'space-between',
   alignItems: 'center',
   margin: 20,
   padding: 10
  },
  list: {
    paddingTop: 30,
    maxWidth: '100%',
  },
  nestedList: {
    paddingLeft: 10,
    alignItems: 'flex-start'
  },
  rowViewContainer: {
    fontSize: 18,
    paddingRight: 10,
    paddingTop: 10,
    paddingBottom: 10,
  },
  linearMiddle: {
    flexDirection: 'row',
  }
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
      this.apiSearch()
    })
  }

  apiSearch = () =>{
    let self = this;

    fetch('http://192.168.2.25:3030/search/' + this.state.savedSearchText + '?$limit=' + this.state.searchLimit + '&$skip=' + this.state.searchSkip, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + self.state.accessToken
      }
    })
    .then((response) => response.json(),
      (error) => Alert.alert('No Internet Connection'))
    .then((responseJson) => {
      if (responseJson !== undefined) {
        if (responseJson.code === undefined || responseJson.code == 200) {
          let friends = [];

          if (responseJson.users.data.length < self.state.searchLimit || responseJson.users.data.limit === self.state.searchLimit + self.state.searchLimit) {
            self.setState({
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
            dataSource: this.state.dataSource.cloneWithRows(this.state.listDataSource),
          }, () => {
            self.setState({
              currentlySearching: false
            })
          })
        }
        else {
          Alert.alert('Failed to search', '' + JSON.stringify(responseJson))
        }
      }
    })
    .catch((error) => {
      console.error(error);
    });
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
      <View>
        <View style={styles.linearMiddle}>
          <TextInput
            style={{height: 40, width: 200}}
            placeholder="Search"
            autoCapitalize='none'
            returnKeyType='next'
            underlineColorAndroid={'#ffb028'}
            maxLength={100}
            onChangeText={(text) => this.setState({searchText: text})}
          />
          <Button
            onPress={this.startSearch}
            title={"Search"}
            color="#ffb028"
          />
        </View>
        <View>
          <ListView
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