import React, { Component } from 'react';
import { Alert, StyleSheet, View, Text, SectionList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { createBottomTabNavigator } from 'react-navigation';

import Search from './Search'
import Profile from './Profile'
import StatusBarOffset from './StatusBarOffset'
import {getFriends, getRequests, getProfile, acceptRequest, rejectRequest, removeFriend} from './utils/APICalls'
import {COLORS, STRINGS} from './utils/ProjectConstants'

const styles = StyleSheet.create({
  container: {
   flex: 1,
   backgroundColor: COLORS.BACKGROUND_COLOR,
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

      requestSectionExpanded: false,

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
                friendInfo.push(STRINGS.FRIENDS)
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
          Alert.alert(STRINGS.GET_FRIENDS_LIST_FAIL, '' + JSON.stringify(responseJson))
        }

        this.setState({
          friendCurrentlyLoading: false
        })
      }
    }

    let onFailure = (error) => {
      this.setError(STRINGS.NO_INTERNET)
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
                friendInfo.push(STRINGS.REQUESTEE)
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
          Alert.alert(STRINGS.GET_REQUESTS_LIST_FAIL, '' + JSON.stringify(responseJson))
        }

        this.setState({
          requestCurrentlyLoading: false
        })
      }
    }

    let onFailure = (error) => {
      this.setError(STRINGS.NO_INTERNET)
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

    if (rowData[3] === STRINGS.FRIENDS) {
      this.getProfileHelper(rowData)
    }
    else {
     Alert.alert(STRINGS.REQUEST_RESPONSE_ALERT_HEADER, STRINGS.REQUEST_RESPONSE_ALERT_BODY + rowData[2] + '?',
      [
        {text: STRINGS.REQUEST_RESPONSE_ALERT_CANCEL, style: 'cancel'},
        {text: STRINGS.REQUEST_RESPONSE_ALERT_REJECT, onPress: () => this.rejectRequestHelper(rowData)},
        {text: STRINGS.REQUEST_RESPONSE_ALERT_ACCEPT, onPress: () => this.acceptRequestHelper(rowData)},
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
                {text: STRINGS.PROFILE_ALERT_DELETE, onPress: () => this.removeFriendHelper(rowData)},
                {text: STRINGS.PROFILE_ALERT_OK},
              ],)
          }
          else {
            Alert.alert(rowData[1], STRINGS.PROFILE_ALERT_NO_PROFILE,
            [
              {text: STRINGS.PROFILE_ALERT_DELETE, onPress: () => this.removeFriendHelper(rowData)},
              {text: STRINGS.PROFILE_ALERT_OK},
            ],)
          }
        }
        else {
          Alert.alert(STRINGS.GET_PROFILE_FAIL, '' + JSON.stringify(responseJson))
        }
      }
    }

    let onFailure = (error) => {
      Alert.alert(STRINGS.NO_INTERNET)
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
          Alert.alert(STRINGS.ACCEPT_REQUEST_FAIL, '' + JSON.stringify(responseJson))
        }
      }
    }

    let onFailure = (error) => {
      Alert.alert(STRINGS.NO_INTERNET)
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
          Alert.alert(STRINGS.REJECT_REQUEST_FAIL, '' + JSON.stringify(responseJson))
        }
      }
    }

    let onFailure = (error) => {
      Alert.alert(STRINGS.NO_INTERNET)
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
          Alert.alert(STRINGS.DELETE_FRIEND_FAIL, '' + JSON.stringify(responseJson))
        }
      }
    }

    let onFailure = (error) => {
      Alert.alert(STRINGS.NO_INTERNET)
    }

    removeFriend(rowData[4], onSuccess, onFailure)
  }

  headerPress = (sectionTitle) => {
    if (sectionTitle.indexOf(STRINGS.REQUEST_SECTION_HEADER) != -1) {
      this.setState({
        requestSectionExpanded: !this.state.requestSectionExpanded
      })
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <StatusBarOffset />
        <SectionList
          enableEmptySections={true}
          renderItem={({item, index, section}) => 
            <TouchableOpacity key={index} style={{backgroundColor: COLORS.BACKGROUND_COLOR}} onPress={this.onPressFn.bind(this, item)}>
              {(this.state.requestSectionExpanded || item[3] !== STRINGS.REQUESTEE) && 
              <View>
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
                    borderBottomColor: COLORS.ROW_BORDER,
                    borderBottomWidth: 1,
                  }}
                />
              </View>}
            </TouchableOpacity>
          }
          renderSectionHeader={({section: {title}}) => (
            <TouchableOpacity
              style={{
                borderBottomColor: COLORS.ROW_BORDER,
                borderBottomWidth: 1,
                flexDirection: 'row',
              }}
              onPress={this.headerPress.bind(this, title)}
            >
              <Text style={styles.sectionHeader}>
                {title}
              </Text>
              {((this.state.friendCurrentlyLoading && title.indexOf(STRINGS.FRIEND_SECTION_HEADER != -1)) || 
                (this.state.requestCurrentlyLoading && title.indexOf(STRINGS.REQUEST_SECTION_HEADER != -1))) 
                && <ActivityIndicator size="small" color={COLORS.PRIMARY_COLOR} />
              }
            </TouchableOpacity>
          )}
          sections={this.state.requestSectionData.length !== 0 ? [
            {title: STRINGS.REQUEST_SECTION_HEADER + '(' + this.state.requestSectionData.length + ')', data: this.state.requestSectionData},
            {title: '\n' + STRINGS.FRIEND_SECTION_HEADER, data: this.state.friendSectionData},
          ] : [
            {title: STRINGS.FRIEND_SECTION_HEADER, data: this.state.friendSectionData},
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
      activeTintColor: COLORS.BACKGROUND_COLOR,
      inactiveTintColor: COLORS.PRIMARY_COLOR,
      activeBackgroundColor: COLORS.PRIMARY_COLOR,
      inactiveBackgroundColor: COLORS.BACKGROUND_COLOR,
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