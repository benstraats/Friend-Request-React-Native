import React, { Component } from 'react';
import { Alert, StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, Button } from 'react-native';
import {getProfile, acceptRequest, rejectRequest, requestUser, removeFriend} from './utils/APICalls'
import {COLORS, STRINGS} from './utils/ProjectConstants'

const styles = StyleSheet.create({
  closeColumn: {
    flex: 1,
    flexDirection: 'column',
  },
  spacedRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textBold: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingLeft: 20,
    paddingRight: 20,
    color: COLORS.TEXT_COLOR
  },
  textFaded: {
    fontSize: 12,
    paddingLeft: 20,
    paddingRight: 20,
    color: COLORS.TEXT_COLOR
  },
  relationshipText: {
    fontSize: 12,
    paddingLeft: 20,
    paddingRight: 20,
    color: COLORS.TEXT_COLOR
  },
  profileText: {
    paddingLeft: 20,
    paddingRight: 20,
    color: COLORS.TEXT_COLOR
  },
  deleteButton: {
    flexDirection: 'row', 
    alignSelf: 'flex-end',
    padding: 3,
  },
})

export default class SearchListItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      usersID: this.props.rowData[0],
      usersName: this.props.rowData[1],
      usersUsername: this.props.rowData[2],
      usersRelationship: this.props.rowData[3],
      usersRelationshipID: this.props.rowData[4],
      currentlyLoading: false,
      loadingProfile: false,
      loadingDelete: false,
      expandedRow: false,
      profileText: '',
    };
  }

  rowPressed = () => {

    if (this.state.currentlyLoading) {return}

    if (this.state.usersRelationship == STRINGS.FRIENDS_MESSAGE) {
      this.friendRowTapped()
    }

    else if (this.state.usersRelationship == STRINGS.REQUESTEE_MESSAGE) {
      Alert.alert(STRINGS.REQUEST_RESPONSE_ALERT_HEADER, STRINGS.REQUEST_RESPONSE_ALERT_BODY + this.state.usersName + ' (' + this.state.usersUsername + ')?',
      [
        {text: STRINGS.REQUEST_RESPONSE_ALERT_CANCEL, style: 'cancel'},
        {text: STRINGS.REQUEST_RESPONSE_ALERT_REJECT, onPress: () => this.rejectRequestHelper(this.state.usersRelationshipID)},
        {text: STRINGS.REQUEST_RESPONSE_ALERT_ACCEPT, onPress: () => this.acceptRequestHelper(this.state.usersRelationshipID)},
      ],);
      
    }

    else if (this.state.usersRelationship == STRINGS.REQUESTER_MESSAGE) {
      Alert.alert(STRINGS.REQUEST_CANCEL_ALERT_HEADER, STRINGS.REQUEST_CANCEL_ALERT_BODY + this.state.usersName + ' (' + this.state.usersUsername + ')?',
      [
        {text: STRINGS.REQUEST_CANCEL_ALERT_DONT_CANCEL, style: 'cancel'},
        {text: STRINGS.REQUEST_CANCEL_ALERT_CANCEL_REQUEST, onPress: () => this.rejectRequestHelper(this.state.usersRelationshipID)},
      ],);
    }

    else if (this.state.usersRelationship == STRINGS.NOT_FRIENDS_MESSAGE) {
      Alert.alert(STRINGS.ADD_ALERT_HEADER, STRINGS.ADD_ALERT_BODY + this.state.usersName + ' (' + this.state.usersUsername + ')?',
      [
        {text: STRINGS.ADD_ALERT_CANCEL},
        {text: STRINGS.ADD_ALERT_SEND, onPress: () => this.sendRequest(this.state.usersID)},
      ],);
    }
  }

  friendRowTapped = () => {
    if (this.state.expandedRow) {//collapse row
      this.setState({
        loadingProfile: false,
        expandedRow: false,
      })
    } else {//expand row
      this.setState({
        loadingProfile: true,
        expandedRow: true,
      })
      this.getProfileHelper(this.state.usersID)
    }
  }

  getProfileHelper = (targetID) =>{

    let onSuccess = (responseJson) => {
      let profile = ''

      let x = responseJson.data;
      let y = x[0]

      if (y !== undefined) {
        let z = y.profile

        z.forEach(function(obj) { 
          profile += "\n" + obj.key + ": " + obj.value
        });
      }
      else {
        profle = "\n" + STRINGS.NO_PROFILE
      }

      this.setState({
        profileText: profile,
        loadingProfile: false,
      })
    }

    let onFailure = (error) => {
      this.setState({
        profileText: '',
        loadingProfile: false,
      })
    }

    getProfile(targetID, onSuccess, onFailure)
  }

  acceptRequestHelper = (requestID) =>{
    this.setState({currentlyLoading:true})

    let onSuccess = (responseJson) => {
      this.setState({
        usersRelationship: STRINGS.FRIENDS_MESSAGE,
        usersRelationshipID: responseJson._id,
        currentlyLoading:false
      })
    }

    let onFailure = (error) => {
      this.setState({currentlyLoading:false})
    }

    acceptRequest(requestID, onSuccess, onFailure)
  }

  rejectRequestHelper = (requestID) =>{
    this.setState({currentlyLoading:true})

    let onSuccess = (responseJson) => {
      this.setState({
        usersRelationship: STRINGS.NOT_FRIENDS_MESSAGE,
        usersRelationshipID: undefined,
        currentlyLoading: false
      })
    }

    let onFailure = (error) => {
      this.setState({currentlyLoading:false})
    }

    rejectRequest(requestID, onSuccess, onFailure)
  }

  sendRequest = (requesteeID) =>{
    this.setState({currentlyLoading:true})

    let onSuccess = (responseJson) => {
      this.setState({
        usersRelationship: STRINGS.REQUESTER_MESSAGE,
        usersRelationshipID: responseJson._id,
        currentlyLoading: false
      })
    }

    let onFailure = (error) => {
      this.setState({currentlyLoading:false})
    }

    requestUser(requesteeID, onSuccess, onFailure)
  }

  removeFriendHelper = () =>{
    this.setState({
      currentlyLoading:true,
      loadingDelete:true,
    })

    let onSuccess = (responseJson) => {
      this.setState({
        usersRelationship: STRINGS.NOT_FRIENDS_MESSAGE,
        usersRelationshipID: undefined,
        currentlyLoading: false,
        loadingDelete:false,
      })
    }

    let onFailure = (error) => {
      this.setState({
        currentlyLoading:false,
        loadingDelete:false,
      })
    }

    removeFriend(this.state.usersRelationshipID, onSuccess, onFailure)
  }

  deleteFriendAlert = () => {
    Alert.alert(STRINGS.DELETE_FRIEND_ALERT_HEADER, STRINGS.DELETE_FRIEND_ALERT_BODY + this.state.usersName + '?',
      [
        {text: STRINGS.DELETE_FRIEND_ALERT_CANCEL, style: 'cancel'},
        {text: STRINGS.DELETE_FRIEND_ALERT_ACCEPT, onPress: () => this.removeFriendHelper()},
      ],); 
  }

  render() {
    return (
      <View>
        <TouchableOpacity style={{backgroundColor: COLORS.BACKGROUND_COLOR}} onPress={() => this.rowPressed()}>
            <View style={styles.spacedRow}>
              <View>
                  <Text style={styles.textBold}>
                      {this.state.usersName}
                  </Text>
                  <Text style={styles.textFaded}>
                      {this.state.usersUsername}
                  </Text>
              </View>
              <View>
                  {this.state.currentlyLoading ? 
                  <ActivityIndicator size="small" color={COLORS.PRIMARY_COLOR} /> :
                  <Text style={styles.textFaded}>
                      {this.state.usersRelationship}
                  </Text>}
              </View>
            </View>
            {(this.state.usersRelationship == STRINGS.FRIENDS_MESSAGE && this.state.expandedRow) &&
              <View>
                {this.state.loadingProfile && 
                  <ActivityIndicator size="small" color={COLORS.PRIMARY_COLOR} />
                }
                <Text style={styles.profileText} >
                  {this.state.profileText}
                </Text>
                {!this.state.loadingDelete && 
                  <View style={styles.deleteButton}>
                    <Button
                      onPress={() => this.deleteFriendAlert()}
                      title={STRINGS.DELETE_FRIEND}
                      color={COLORS.PRIMARY_COLOR}
                    />
                  </View>
                }
              </View>
            }
        </TouchableOpacity>
        <View
          style={{
            borderBottomColor: COLORS.ROW_BORDER,
            borderBottomWidth: 1,
          }}
        />
      </View>
    );
  }
}