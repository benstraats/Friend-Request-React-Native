import React, { Component } from 'react';
import { Alert, StyleSheet, View, Text, SectionList, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from 'react-navigation';

import Search from './Search'
import Profile from './Profile'
import StatusBarOffset from './StatusBarOffset'

const styles = StyleSheet.create({
  container: {
   flex: 1,
   backgroundColor: '#fff',
  },
  sectionHeader: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  textBold: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  textFaded: {
    fontSize: 12
  },
})

class Landing extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userID: this.props.navigation.state.params.userID,
      fullNameText: this.props.navigation.state.params.name, 
      usernameText: this.props.navigation.state.params.username, 
      accessToken: this.props.navigation.state.params.accessToken,

      friendSkip: 0,
      friendLimit: 50,
      friendCurrentlyLoading: true,
      friendFullyDoneLoading: false,

      requestSkip: 0,
      requestLimit: 50,
      requestCurrentlyLoading: true,
      requestFullyDoneLoading: false,

      requestSectionData: [],
      friendSectionData: [],
    };
    this.getFriends()
    this.getRequests()
  }

  initialLoad = () => {
    this.setState({
      requestSectionData: [],
      friendSectionData: [],
      friendSkip: 0,
      friendCurrentlyLoading: true,
      friendFullyDoneLoading: false,

      requestSkip: 0,
      requestCurrentlyLoading: true,
      requestFullyDoneLoading: false,
    })

    this.getFriends()
    this.getRequests()
  }

  scrolledToBottom = () => {
    this.loadNextFriends()
    this.loadNextRequests()
  }

  loadNextFriends = () => {
    if (!this.state.friendCurrentlyLoading && !this.state.friendFullyDoneLoading) {
      this.setState({
        friendSkip: this.state.friendSkip + this.state.friendLimit,
        friendCurrentlyLoading: true,
      })

      this.getFriends()
    }
  }

  loadNextRequests = () => {
    if (!this.state.requestCurrentlyLoading && !this.state.requestFullyDoneLoading) {
      this.setState({
        requestSkip: this.state.requestSkip + this.state.requestLimit,
        requestCurrentlyLoading: true,
      })

      this.getRequests()
    }
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

    fetch('http://192.168.2.25:3030/myfriends?$limit=' + self.state.friendLimit + '&$skip=' + self.state.friendSkip, {
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

          if (responseJson.friends.data.length < self.state.friendLimit || responseJson.friends.data.limit === self.state.friendLimit + self.state.friendSkip) {
            self.setState({
              friendFullyDoneLoading: true
            })
          }

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
                friendInfo.push('friend')
              }
            })

            friends.push(friendInfo)
          });

          self.setState({
            friendSectionData: this.state.friendSectionData.concat(friends)
          })
        }
        else {
          Alert.alert('Failed to get friends', '' + JSON.stringify(responseJson))
        }

        self.setState({
          friendCurrentlyLoading: false
        })
      }
    })
    .catch((error) => {
      console.error(error);
    });
  }

  getRequests = () =>{
    let self = this;

    fetch('http://192.168.2.25:3030/myrequests?$limit=' + self.state.requestLimit + '&$skip=' + self.state.requestSkip, {
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

          if (responseJson.requests.data.length < self.state.requestLimit || responseJson.requests.data.limit === self.state.requestLimit + self.state.requestSkip) {
            self.setState({
              requestFullyDoneLoading: true
            })
          }

          responseJson.requests.data.forEach(function(obj) { 
            let requesterID = obj.requester

            friendInfo = []
            friendInfo.push(requesterID)

            responseJson.users.data.forEach(function(userObj) {
              if (userObj._id == requesterID) {
                friendInfo.push(userObj.name)
                friendInfo.push(userObj.email)
                friendInfo.push("request")
              }
            })

            friendInfo.push(obj._id)

            friends.push(friendInfo)
          });

          self.setState({
            requestSectionData: this.state.requestSectionData.concat(friends)
          })
        }
        else {
          Alert.alert('Failed to get friend requests', '' + JSON.stringify(responseJson))
        }

        self.setState({
          requestCurrentlyLoading: false
        })
      }
    })
    .catch((error) => {
      console.error(error);
    });
  }

  //Using this function as a hold since figuring it out was a pain
  setTouched = (rowData) =>{
    //There HAS to be a better way
    let index = this.state.friendSectionData.indexOf(rowData);
    let clonedArray = JSON.parse(JSON.stringify(this.state.friendSectionData))
    clonedArray[index][1] = 'TOUCHED'

    this.setState({
      friendSectionData: clonedArray
    })
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
      .then((response) => response.json(),
        (error) => Alert.alert('No Internet Connection'))
      .then((responseJson) => {
        if (responseJson !== undefined) {
          if (responseJson.code === undefined || responseJson.code == 200) {
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
          }
          else {
            Alert.alert('Failed to get profile', '' + JSON.stringify(responseJson))
          }
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
        {text: 'Reject', onPress: () => this.rejectRequest(rowData)},
        {text: 'Accept', onPress: () => this.acceptRequest(rowData)},
      ],); 
    }
  }

  acceptRequest = (rowData) =>{

    let self = this;
    let requestID = rowData[4]

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
    .then((response) => response.json(),
      (error) => Alert.alert('No Internet Connection'))
    .then((responseJson) => {
      if (responseJson !== undefined) {
        if (responseJson.code === undefined || responseJson.code == 200) {
          Alert.alert('Accepted request')
          let index = this.state.requestSectionData.indexOf(rowData);
          let clonedArray = JSON.parse(JSON.stringify(this.state.requestSectionData))
          clonedArray.splice(index, 1);

          this.setState({
            requestSectionData: clonedArray
          })

          let friendClonedArray = JSON.parse(JSON.stringify(this.state.friendSectionData))
          friendClonedArray.push(rowData);

          this.setState({
            friendSectionData: friendClonedArray
          })
        }
        else {
          Alert.alert('Faile dto accept request', '' + JSON.stringify(responseJson))
        }
      }
    })
    .catch((error) => {
      console.error(error);
    });
  }

  rejectRequest = (rowData) =>{

    let self = this;
    let requestID = rowData[4]

    fetch('http://192.168.2.25:3030/requests/' + requestID, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + self.state.accessToken
      },
    })
    .then((response) => response.json(),
      (error) => Alert.alert('No Internet Connection'))
    .then((responseJson) => {
      if (responseJson !== undefined) {
        if (responseJson.code === undefined || responseJson.code == 200) {
          Alert.alert('Rejected request')
          let index = this.state.requestSectionData.indexOf(rowData);
          let clonedArray = JSON.parse(JSON.stringify(this.state.requestSectionData))
          clonedArray.splice(index, 1);

          this.setState({
            requestSectionData: clonedArray
          })
        }
        else {
          Alert.alert('Failed to reject request', '' + JSON.stringify(responseJson))
        }
      }
    })
    .catch((error) => {
      console.error(error);
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <StatusBarOffset />
        <SectionList
          enableEmptySections={true}
          renderItem={({item, index, section}) => 
            <TouchableOpacity key={index} style={{backgroundColor: "white"}} onPress={this.onPressFn.bind(this, item)}>
              <View>
                <Text style={styles.textBold}>
                  {item[1]}
                </Text>
                <Text style={styles.textFaded}>
                  {item[2]}
              </Text>
            </View>
            <View
              style={{
                borderBottomColor: 'black',
                borderBottomWidth: 1,
              }}
            />
          </TouchableOpacity>
          }
          renderSectionHeader={({section: {title}}) => (
            <Text style={styles.sectionHeader}>{title}</Text>
          )}
          sections={[
            {title: 'Requests', data: this.state.requestSectionData},
            {title: '\nFriends', data: this.state.friendSectionData},
          ]}
          keyExtractor={(item, index) => item + index}
          onEndReached={this.scrolledToBottom()}
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