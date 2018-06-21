import React, { Component } from 'react';
import { Alert, StyleSheet, View, Text, SectionList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { createBottomTabNavigator } from 'react-navigation';

import Search from './Search'
import Profile from './Profile'
import StatusBarOffset from './StatusBarOffset'
import {getFriends, getRequests, getProfile, acceptRequest, rejectRequest, removeFriend} from './utils/APICalls'

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
    this.getFriendsHelper()
    this.getRequestsHelper()
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

    this.getFriendsHelper()
    this.getRequestsHelper()
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

      this.getFriendsHelper()
    }
  }

  loadNextRequests = () => {
    if (!this.state.requestCurrentlyLoading && !this.state.requestFullyDoneLoading) {
      this.setState({
        requestSkip: this.state.requestSkip + this.state.requestLimit,
        requestCurrentlyLoading: true,
      })

      this.getRequestsHelper()
    }
  }

  getFriendsHelper = () =>{
    let self = this;

    let onSuccess = (responseJson) => {
      if (responseJson !== undefined) {
        if (responseJson.code === undefined || responseJson.code == 200) {
          let friends = [];

          if (responseJson.friends.data.length < this.state.friendLimit || responseJson.friends.data.limit === this.state.friendLimit + this.state.friendSkip) {
            this.setState({
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
            friendInfo.push(obj._id)

            friends.push(friendInfo)
          });

          this.setState({
            friendSectionData: this.state.friendSectionData.concat(friends)
          })
        }
        else {
          Alert.alert('Failed to get friends', '' + JSON.stringify(responseJson))
        }

        this.setState({
          friendCurrentlyLoading: false
        })
      }
    }

    let onFailure = (error) => {
      this.setError('No Internet Connection')
    }

    getFriends(this.state.friendLimit, this.state.friendSkip, onSuccess, onFailure)
  }

  getRequestsHelper = () =>{

    let onSuccess = (responseJson) => {
      if (responseJson !== undefined) {
        if (responseJson.code === undefined || responseJson.code == 200) {
          let friends = [];

          if (responseJson.requests.data.length < this.state.requestLimit || responseJson.requests.data.limit === this.state.requestLimit + this.state.requestSkip) {
            this.setState({
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

          this.setState({
            requestSectionData: this.state.requestSectionData.concat(friends)
          })
        }
        else {
          Alert.alert('Failed to get friend requests', '' + JSON.stringify(responseJson))
        }

        this.setState({
          requestCurrentlyLoading: false
        })
      }
    }

    let onFailure = (error) => {
      this.setError('No Internet Connection')
    }

    getRequests(this.state.requestLimit, this.state.requestSkip, onSuccess, onFailure)
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
      this.getProfileHelper(rowData)
    }
    else {
     Alert.alert('Accept Request', 'Do you want to accept the friend request from ' + rowData[2] + '?',
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Reject', onPress: () => this.rejectRequestHelper(rowData)},
        {text: 'Accept', onPress: () => this.acceptRequestHelper(rowData)},
      ],); 
    }
  }

  getProfileHelper = (rowData) => {
    let onSuccess = (responseJson) => {
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

            Alert.alert(rowData[1], profile,
              [
                {text: 'OK'},
                {text: 'Delete Friend', onPress: () => this.removeFriendHelper(rowData)},
              ],)
          }
          else {
            Alert.alert(rowData[1], "User has no profile",
            [
              {text: 'Delete Friend', onPress: () => this.removeFriendHelper(rowData)},
              {text: 'OK'},
            ],)
          }
        }
        else {
          Alert.alert('Failed to get profile', '' + JSON.stringify(responseJson))
        }
      }
    }

    let onFailure = (error) => {
      Alert.alert('No Internet Connection')
    }

    getProfile(rowData[0], onSuccess, onFailure)
  }

  acceptRequestHelper = (rowData) =>{
    let onSuccess = (responseJson) => {
      if (responseJson !== undefined) {
        if (responseJson.code === undefined || responseJson.code == 200) {
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
    }

    let onFailure = (error) => {
      Alert.alert('No Internet Connection')
    }

    acceptRequest(rowData[4], onSuccess, onFailure)
  }

  rejectRequestHelper = (rowData) =>{
    let onSuccess = (responseJson) => {
      if (responseJson !== undefined) {
        if (responseJson.code === undefined || responseJson.code == 200) {
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
    }

    let onFailure = (error) => {
      Alert.alert('No Internet Connection')
    }

    rejectRequest(rowData[4], onSuccess, onFailure)
  }

  removeFriendHelper = (rowData) =>{
    let onSuccess = (responseJson) => {
      if (responseJson !== undefined) {
        if (responseJson.code === undefined || responseJson.code == 200) {
          let index = this.state.friendSectionData.indexOf(rowData);
          let clonedArray = JSON.parse(JSON.stringify(this.state.friendSectionData))
          clonedArray.splice(index, 1);

          this.setState({
            friendSectionData: clonedArray
          })
        }
        else {
          Alert.alert('Failed to reject request', '' + JSON.stringify(responseJson))
        }
      }
    }

    let onFailure = (error) => {
      Alert.alert('No Internet Connection')
    }

    removeFriend(rowData[4], onSuccess, onFailure)
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
            <View
              style={{
                borderBottomColor: 'black',
                borderBottomWidth: 1,
                flexDirection: 'row',
              }}
            >
            <Text style={styles.sectionHeader}>{title}</Text>
            {((this.state.friendCurrentlyLoading && title.indexOf('Friends' != -1)) || 
            (this.state.requestCurrentlyLoading && title === 'Requests')) 
            && <ActivityIndicator size="small" color="#ffb028" />}
            </View>
          )}
          sections={this.state.requestSectionData.length !== 0 ? [
            {title: 'Requests', data: this.state.requestSectionData},
            {title: '\nFriends', data: this.state.friendSectionData},
          ] : [
            {title: 'Friends', data: this.state.friendSectionData},
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