import React, { Component } from 'react';
import { Alert, StyleSheet, View, Text, SectionList, TouchableOpacity, ActivityIndicator, RefreshControl, AppState, Button } from 'react-native';
import { createBottomTabNavigator } from 'react-navigation';
import Ionicons from 'react-native-vector-icons/Ionicons';

import Search from './Search'
import Profile from './Profile'
import StatusBarOffset from './StatusBarOffset'
import TopBar from './TopBar'
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
    paddingLeft: 5,
    paddingRight: 5,
  },
  textBold: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingLeft: 20,
    paddingRight: 20,
  },
  textFaded: {
    fontSize: 12,
    paddingLeft: 20,
    paddingRight: 20,
  },
  profileText: {
    paddingLeft: 20,
    paddingRight: 20,
  },
  deleteButton: {
    flexDirection: 'row', 
    alignSelf: 'flex-end',
    padding: 3,
  }
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

      refreshing: false,

      friendSkip: 0,
      friendLimit: 50,
      friendCurrentlyLoading: true,
      friendFullyDoneLoading: false,

      requestSkip: 0,
      requestLimit: 50,
      requestCurrentlyLoading: true,
      requestFullyDoneLoading: false,
      requestTotal: 0,

      requestSectionData: [],
      friendSectionData: [],

      appState: AppState.currentState
    };
    this.getFriendsHelper()
    this.getRequestsHelper()
  }

  componentDidMount() {
    AppState.addEventListener('change', this._handleAppStateChange);
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange);
  }

  _handleAppStateChange = (nextAppState) => {
    if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
      //This wont be triggered on tab switching of profile and search. Good thing?
      this.initialLoad();
    }
    this.setState({appState: nextAppState});
  }

  initialLoad = () => {
    this.setState({
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
  }

  loadNextFriends = () => {
    if (!this.state.friendCurrentlyLoading && !this.state.friendFullyDoneLoading) {
      this.setState({
        friendSkip: this.state.friendSkip + this.state.friendLimit,
        friendCurrentlyLoading: true,
      }, () => {
        this.getFriendsHelper()
      })
    }
  }

  loadNextRequests = () => {
    if (!this.state.requestCurrentlyLoading && !this.state.requestFullyDoneLoading) {
      this.setState({
        requestSkip: this.state.requestSkip + this.state.requestLimit,
        requestCurrentlyLoading: true,
      }, () => {
        this.getRequestsHelper()
      })
    }
  }

  getFriendsHelper = () =>{
    let self = this;

    let onSuccess = (responseJson) => {

      if (responseJson === undefined) {
        this.getFriendsHelper()
      }
      else if (responseJson.code === undefined || responseJson.code == 200) {
        let friends = [];

        if (responseJson.friends.total <= this.state.friendLimit + this.state.friendSkip) {
          this.setState({
            friendFullyDoneLoading: true
          })
        }

        responseJson.friends.data.forEach(function(obj) { 
          let friendID = obj.user1

          if (friendID == self.state.userID) {
            friendID = obj.user2
          }

          friendInfo = {}
          friendInfo.userID = friendID

          responseJson.users.data.forEach(function(obj) {
            if (obj._id == friendID) {
              friendInfo.userName = obj.name
              friendInfo.userEmail = obj.email
              friendInfo.relationship = STRINGS.FRIENDS
            }
          })
          friendInfo.relationshipID = obj._id
          friendInfo.expanded = false
          friendInfo.profileInfo = ''
          friendInfo.loadingProfile = false
          friendInfo.deletingUser = false

          friends.push(friendInfo)
        });

        if (this.state.friendSkip === 0) {
          this.setState({
            friendSectionData: friends
          })
        } else {
          this.setState({
            friendSectionData: this.state.friendSectionData.concat(friends)
          })
        }

        this.setState({
          friendCurrentlyLoading: false,
          refreshing: false,
        })
      }
      else {
        //bad response code
        this.setState({
          friendCurrentlyLoading: false,
        })
      }
    }

    let onFailure = (error) => {
      //fatal error
    }

    getFriends(this.state.friendLimit, this.state.friendSkip, onSuccess, onFailure)
  }

  getRequestsHelper = () =>{
    let onSuccess = (responseJson) => {
      if (responseJson === undefined) {
        this.getRequestsHelper()
      }
      else if (responseJson.code === undefined || responseJson.code == 200) {
        let requests = [];
  
          if (responseJson.requests.total <= this.state.requestLimit + this.state.requestSkip) {
            this.setState({
              requestFullyDoneLoading: true
            })
          }
  
          this.setState({
            requestTotal: responseJson.requests.total
          })
  
          responseJson.requests.data.forEach(function(obj) { 
            let requesterID = obj.requester
  
            requestInfo = {}
            requestInfo.userID = requesterID
  
            responseJson.users.data.forEach(function(userObj) {
              if (userObj._id == requesterID) {
                requestInfo.userName = userObj.name
                requestInfo.userEmail = userObj.email
                requestInfo.relationship = STRINGS.REQUESTEE
              }
            })
            requestInfo.relationshipID = obj._id
            requestInfo.expanded = false
            requestInfo.profileInfo = ''
            requestInfo.loadingProfile = false
            requestInfo.deletingUser = false
  
            requests.push(requestInfo)
          });
  
          if (this.state.requestSkip === 0) {
            this.setState({
              requestSectionData: requests
            })
          } else {
            this.setState({
              requestSectionData: this.state.requestSectionData.concat(requests)
            })
          }
  
          this.setState({
            requestCurrentlyLoading: false,
            refreshing: false,
          })
      }
      else {
        //bad response
        this.setState({
          requestCurrentlyLoading: false,
        })
      }
    }

    let onFailure = (error) => {
      this.getRequestsHelper()
    }

    getRequests(this.state.requestLimit, this.state.requestSkip, onSuccess, onFailure)
  }

  onPressFn = (rowData) =>{
    if (rowData.relationship === STRINGS.FRIENDS) {
      let index = this.state.friendSectionData.indexOf(rowData);
      let clonedArray = JSON.parse(JSON.stringify(this.state.friendSectionData))
      clonedArray[index].expanded = !clonedArray[index].expanded

      if (clonedArray[index].expanded) {
        clonedArray[index].loadingProfile = true
      } else {
        clonedArray[index].loadingProfile = false
      }

      this.setState({
        friendSectionData: clonedArray
      })

      this.getProfileHelper(clonedArray[index]);
    }
    else {
     Alert.alert(STRINGS.REQUEST_RESPONSE_ALERT_HEADER, STRINGS.REQUEST_RESPONSE_ALERT_BODY + rowData.userEmail + '?',
      [
        {text: STRINGS.REQUEST_RESPONSE_ALERT_CANCEL, style: 'cancel'},
        {text: STRINGS.REQUEST_RESPONSE_ALERT_REJECT, onPress: () => this.rejectRequestHelper(rowData)},
        {text: STRINGS.REQUEST_RESPONSE_ALERT_ACCEPT, onPress: () => this.acceptRequestHelper(rowData)},
      ],); 
    }
  }

  getProfileHelper = (rowData) => {
    let onSuccess = (responseJson) => {
      if (responseJson === undefined) {
        this.getProfileHelper(rowData)
      }
      else if (responseJson.code === undefined || responseJson.code == 200) {
        let profile = ''

        let x = responseJson.data;
        let y = x[0]

        if (y !== undefined) {
          let z = y.profile

          z.forEach(function(obj) { 
            profile +=  "\n" + obj.key + ": " + obj.value
          });
        }
        else {
          profile = '\n' + STRINGS.NO_PROFILE
        }
        let index = this.state.friendSectionData.indexOf(rowData);
        let clonedArray = JSON.parse(JSON.stringify(this.state.friendSectionData))
        clonedArray[index].profileInfo = profile
        clonedArray[index].loadingProfile = false

        this.setState({
          friendSectionData: clonedArray
        })
      }
      else {
        //bad response
      }
    }

    let onFailure = (error) => {
      //fatal error
    }

    getProfile(rowData.userID, onSuccess, onFailure)
  }

  acceptRequestHelper = (rowData) =>{
    let onSuccess = (responseJson) => {
      if (responseJson === undefined) {
        this.acceptRequestHelper(rowData)
      }
      else if (responseJson.code === undefined || responseJson.code == 200) {
        let index = this.state.requestSectionData.indexOf(rowData);
        let clonedArray = JSON.parse(JSON.stringify(this.state.requestSectionData))
        clonedArray.splice(index, 1);

        this.setState({
          requestSectionData: clonedArray,
          requestTotal: this.state.requestTotal-1,
        })

        if (this.state.friendFullyDoneLoading) {
          rowData.relationship = STRINGS.FRIENDS
          rowData.relationshipID = responseJson._id

          let friendClonedArray = JSON.parse(JSON.stringify(this.state.friendSectionData))
          friendClonedArray.push(rowData);

          this.setState({
            friendSectionData: friendClonedArray,
          })
        }
      }
      else {
        //response Error
      }
    }

    let onFailure = (error) => {
      //fatal error
    }

    acceptRequest(rowData.relationshipID, onSuccess, onFailure)
  }

  rejectRequestHelper = (rowData) =>{
    let onSuccess = (responseJson) => {

      if (responseJson === undefined) {
        this.rejectRequestHelper(rowData)
      }
      else if (responseJson.code === undefined || responseJson.code == 200) {
        let index = this.state.requestSectionData.indexOf(rowData);
          let clonedArray = JSON.parse(JSON.stringify(this.state.requestSectionData))
          clonedArray.splice(index, 1);

          this.setState({
            requestSectionData: clonedArray,
            requestTotal: this.state.requestTotal-1,
          })
      }
      else {
        //response error
      }
    }

    let onFailure = (error) => {
      //fatal error
    }

    rejectRequest(rowData.relationshipID, onSuccess, onFailure)
  }

  removeFriendHelper = (rowData) =>{
    let index = this.state.friendSectionData.indexOf(rowData);
    let clonedArray = JSON.parse(JSON.stringify(this.state.friendSectionData))
    clonedArray[index].deletingUser = true
    clonedArray[index].loadingProfile = true

    rowData = clonedArray[index]

    this.setState({
      friendSectionData: clonedArray
    })

    let onSuccess = (responseJson) => {

      if (responseJson === undefined) {
        this.removeFriendHelper(rowData)
      }
      else if (responseJson.code === undefined || responseJson.code == 200) {
        let index = this.state.friendSectionData.indexOf(rowData);
        let clonedArray = JSON.parse(JSON.stringify(this.state.friendSectionData))
        clonedArray.splice(index, 1);

        this.setState({
          friendSectionData: clonedArray
        })
      }
      else {
        //response error

        let index = this.state.friendSectionData.indexOf(rowData);
        let clonedArray = JSON.parse(JSON.stringify(this.state.friendSectionData))
        clonedArray[index].deletingUser = false
        clonedArray[index].loadingProfile = false

        this.setState({
          friendSectionData: clonedArray
        })
      }
    }

    let onFailure = (error) => {
      //fatal error
    }

    removeFriend(rowData.relationshipID, onSuccess, onFailure)
  }

  headerPress = (sectionTitle) => {
    if (sectionTitle.indexOf(STRINGS.REQUEST_SECTION_HEADER) != -1) {
      this.setState({
        requestSectionExpanded: !this.state.requestSectionExpanded
      })
    }
  }

  _onRefresh = () => {
    this.setState({refreshing: true});
    this.initialLoad();
  }

  deleteFriendAlert = (rowData) => {
    Alert.alert(STRINGS.DELETE_FRIEND_ALERT_HEADER, STRINGS.DELETE_FRIEND_ALERT_BODY + rowData.userName + '?',
      [
        {text: STRINGS.DELETE_FRIEND_ALERT_CANCEL, style: 'cancel'},
        {text: STRINGS.DELETE_FRIEND_ALERT_ACCEPT, onPress: () => this.removeFriendHelper(rowData)},
      ],); 
  }

  viewableItemsChanged = (items) => {
    if (!this.state.requestCurrentlyLoading && !this.state.requestFullyDoneLoading && this.state.requestSectionExpanded) {
      let friendsSectionVisible = false;
      for (let i=0; i<items.viewableItems.length; i++) {
        if ((items.viewableItems[i].item.title !== undefined && items.viewableItems[i].item.title.indexOf(STRINGS.FRIEND_SECTION_HEADER) != -1) || items.viewableItems[i].item.relationship === STRINGS.FRIENDS) {
          friendsSectionVisible = true;
          break;
        }
      }
      if (friendsSectionVisible) {
        this.loadNextRequests();
      }
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <StatusBarOffset />
        <TopBar mainText={STRINGS.HOME} />
        <SectionList
          enableEmptySections={true}
          renderItem={({item, index, section}) => 
            <TouchableOpacity key={index} style={{backgroundColor: COLORS.BACKGROUND_COLOR}} onPress={this.onPressFn.bind(this, item)}>
              {((this.state.requestSectionExpanded || item.relationship !== STRINGS.REQUESTEE) && item.userID !== undefined && item !== undefined) && 
              <View>
                <View>
                  <Text style={styles.textBold}>
                    {item.userName}
                  </Text>
                  <Text style={styles.textFaded}>
                    {item.userEmail}
                  </Text>
                  {item.expanded &&
                    <View>
                      {item.loadingProfile ? <ActivityIndicator size="small" color={COLORS.PRIMARY_COLOR} /> :
                      <Text style={styles.profileText}>{item.profileInfo}</Text>
                      }
                      {!item.deletingUser &&
                        <View style={styles.deleteButton}>
                          <Button
                            onPress={() => this.deleteFriendAlert(item)}
                            title={STRINGS.DELETE_FRIEND}
                            color={COLORS.PRIMARY_COLOR}
                          />
                        </View>
                      }
                    </View>
                  }
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
            {title: STRINGS.REQUEST_SECTION_HEADER + '(' + this.state.requestTotal + ')', data: this.state.requestSectionData},
            {title: '\n' + STRINGS.FRIEND_SECTION_HEADER, data: this.state.friendSectionData},
          ] : [
            {title: STRINGS.FRIEND_SECTION_HEADER, data: this.state.friendSectionData},
          ]}
          keyExtractor={(item, index) => item + index}
          onEndReached={() => this.scrolledToBottom()}
          onEndReachedThreshold={0.5}
          onViewableItemsChanged={(items) => this.viewableItemsChanged(items)}
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={() => this._onRefresh()}
              colors={[COLORS.PRIMARY_COLOR]}
              tintColor={COLORS.PRIMARY_COLOR}
            />
          }
        />
      </View>
    );
  }
}

export default createBottomTabNavigator(
  {
    Home: { 
      screen: Landing,
      navigationOptions: {
        tabBarLabel: STRINGS.HOME,
        tabBarIcon: ({ tintColor, focused }) => (
          <Ionicons
            name={'ios-home'}
            size={32}
            style={{ color: tintColor }}
          />
        ),
      },
    },
    Search: { 
      screen: Search,
      navigationOptions: {
        tabBarLabel: STRINGS.SEARCH,
        tabBarIcon: ({ tintColor, focused }) => (
          <Ionicons
            name={'md-search'}
            size={32}
            style={{ color: tintColor }}
          />
        ),
      },
    },
    Profile: { 
      screen: Profile,
      navigationOptions: {
        tabBarLabel: STRINGS.PROFILE,
        tabBarIcon: ({ tintColor, focused }) => (
          <Ionicons
            name={'ios-person'}
            size={32}
            style={{ color: tintColor }}
          />
        ),
      },
    },
  },
  {
    tabBarOptions: 
    {
      activeTintColor: COLORS.BACKGROUND_COLOR,
      inactiveTintColor: COLORS.PRIMARY_COLOR,
      activeBackgroundColor: COLORS.PRIMARY_COLOR,
      inactiveBackgroundColor: COLORS.BACKGROUND_COLOR,
      labelStyle: {
        fontSize: 10,
        justifyContent: 'center',
        alignItems: 'center',
      },
      animationEnabled: true,
      swipeEnabled: true,
    }
  },
);