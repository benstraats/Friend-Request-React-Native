import React, { Component } from 'react';
import { Alert, AppRegistry, Button, StyleSheet, View, Image, Text, ListView } from 'react-native';
import { createBottomTabNavigator } from 'react-navigation';

import Search from './Search'
import Profile from './Profile'

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
  rowViewContainer: 
  {
 
    fontSize: 18,
    paddingRight: 10,
    paddingTop: 10,
    paddingBottom: 10,
 
  }
})

class Landing extends Component {
  constructor(props) {
    super(props);
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      userID: this.props.navigation.state.params.userID,
      fullNameText: this.props.navigation.state.params.name, 
      usernameText: this.props.navigation.state.params.username, 
      accessToken: this.props.navigation.state.params.accessToken,
      dataSource: ds.cloneWithRows(['row 1', 'row 2']),
      listDataSource: []
    };
    this.getFriends()
    this.getRequests()
  }

  showUserInfo = () =>{
    Alert.alert("Info", 
      "UserID: " + this.state.userID +
      "\nUsername: " + this.state.usernameText + 
      "\nFull Name: " + this.state.fullNameText +
      "\nAccess Token: " + this.state.accessToken);
  }

  getFriends = () =>{
    let self = this;

    fetch('http://192.168.2.25:3030/myfriends?$limit=50', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + self.state.accessToken
      }
    })
    .then((response) => response.json())
    .then((responseJson) => {
      let friends = [];

      responseJson.friends.data.forEach(function(obj) { 
        let friendID = obj.user1

        if (friendID == self.state.userID) {
          friendID = obj.user2
        }

        friendInfo = []
        friendInfo.push(friendID)

        responseJson.users.data.forEach(function(obj) {
          if (obj._id == friendID) {
            friendInfo.push(obj.name)
            friendInfo.push(obj.email)
            friendInfo.push("friend")
          }
        })

        friends.push(friendInfo)
      });

      self.setState({
        listDataSource: this.state.listDataSource.concat(friends)
      })

      self.setState({
        dataSource: this.state.dataSource.cloneWithRows(this.state.listDataSource)
      })
    })
    .catch((error) => {
      console.error(error);
    });
  }

  getRequests = () =>{
    let self = this;

    fetch('http://192.168.2.25:3030/myrequests?$limit=50', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + self.state.accessToken
      }
    })
    .then((response) => response.json())
    .then((responseJson) => {
      let friends = [];

      responseJson.requests.data.forEach(function(obj) { 
        let requesterID = obj.requester

        friendInfo = []
        friendInfo.push(requesterID)

        responseJson.users.data.forEach(function(obj) {
          if (obj._id == requesterID) {
            friendInfo.push("Request From: " + obj.name)
            friendInfo.push(obj.email)
            friendInfo.push("request")
          }
        })

        friends.push(friendInfo)
      });

      self.setState({
        listDataSource: this.state.listDataSource.concat(friends)
      })

      self.setState({
        dataSource: this.state.dataSource.cloneWithRows(this.state.listDataSource)
      })
    })
    .catch((error) => {
      console.error(error);
    });
  }

  ListViewItemSeparatorLine = () => {
    return (
      <View
        style={{
          height: .5,
          width: "100%",
          backgroundColor: "#000",
        }}
      />
    );
  }

  onPressFn = (rowData) =>{

    if (rowData[3] === "friend") {
      let self = this;

      fetch('http://192.168.2.25:3030/profile?userID=' + rowData[0], {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + self.state.accessToken
        }
      })
      .then((response) => response.json())
      .then((responseJson) => {
        let profile = ''

        let x = responseJson.data;
        let y = x[0]

        if (y !== undefined) {
          let z = y.profile

          z.forEach(function(obj) { 
            profile += obj.key + ": " + obj.value + "\n"
          });

          Alert.alert(rowData[1], profile)
        }
        else {
          Alert.alert(rowData[1], "User has no profile")
        }
      })
      .catch((error) => {
        console.error(error);
      });
    }
    else {
      Alert.alert("Accept " + rowData[2] + "?", "Are you sure you want to add " + rowData[2] + "?")
    }
  }

  render() {
    return (
      <View style={styles.list}>
        <ListView
          contentContainerStyle={styles.nestedList}
          dataSource={this.state.dataSource}
          renderRow={
            (rowData) => <Text style={styles.rowViewContainer} onPress={this.onPressFn.bind(this, rowData)}>{rowData[1] + "\n" + rowData[2]}</Text>
          }
        />
      </View>
    );
  }
}

export default createBottomTabNavigator(
  {
    Home: { screen: Landing },
    Search: { screen: Search },
    Profile: { screen: Profile },
  },
  {
    tabBarOptions: 
    {
      activeTintColor: 'white',
      inactiveTintColor: '#ffb028',
      activeBackgroundColor: '#ffb028',
      inactiveBackgroundColor: 'white',
      labelStyle: {
        fontSize: 30,
        justifyContent: 'center',
        alignItems: 'center',
      },
      animationEnabled: true,
      swipeEnabled: true,
    }
  },
);