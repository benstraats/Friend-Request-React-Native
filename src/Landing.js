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
      dataSource: ds.cloneWithRows([['','',''], ['','','']]),
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

        responseJson.users.data.forEach(function(userObj) {
          if (userObj._id == requesterID) {
            friendInfo.push('Request from: ' + userObj.name)
            friendInfo.push(userObj.email)
            friendInfo.push("request")
          }
        })

        friendInfo.push(obj._id)

        friends.push(friendInfo)
      });

      self.setState({
        listDataSource: friends.concat(this.state.listDataSource)
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
      Alert.alert('Accept Request', 'Do you want to accept the friend request from ' + rowData[2] + '?',
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Reject', onPress: () => this.rejectRequest(rowData[4])},
        {text: 'Accept', onPress: () => this.acceptRequest(rowData[4])},
      ],);
    }
  }

  acceptRequest = (requestID) =>{

    let self = this;

    fetch('http://192.168.2.25:3030/friends', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + self.state.accessToken
      },
      body: JSON.stringify({
        "requestID": requestID
      })
    })
    .then((response) => response.json())
    .then((responseJson) => {
      Alert.alert('Accepted request')
    })
    .catch((error) => {
      console.error(error);
    });
  }

  rejectRequest = (requestID) =>{

    let self = this;

    fetch('http://192.168.2.25:3030/requests/' + requestID, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + self.state.accessToken
      },
    })
    .then((response) => response.json())
    .then((responseJson) => {
      Alert.alert('Rejected request')
    })
    .catch((error) => {
      console.error(error);
    });
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