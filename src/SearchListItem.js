import React, { Component } from 'react';
import { Alert, StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import {getProfile, acceptRequest, rejectRequest, requestUser} from './utils/APICalls'

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
    fontWeight: 'bold'
  },
  textFaded: {
    fontSize: 12
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
    };
  }

  rowPressed = () => {

    if (this.state.currentlyLoading) {return}

    if (this.state.usersRelationship == 'Friends') {
      this.getProfileHelper(this.state.usersID)
    }

    else if (this.state.usersRelationship == 'Accept Request') {
      Alert.alert('Accept Request', 'Do you want to accept the request from ' + this.state.usersName + ' (' + this.state.usersUsername + ')?',
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Reject', onPress: () => this.rejectRequestHelper(this.state.usersRelationshipID)},
        {text: 'Accept', onPress: () => this.acceptRequestHelper(this.state.usersRelationshipID)},
      ],);
      
    }

    else if (this.state.usersRelationship == 'Cancel Request') {
      Alert.alert('Cancel Request', 'Do you want to cancel the friend request to ' + this.state.usersName + ' (' + this.state.usersUsername + ')?',
      [
        {text: 'Don\'t Cancel', style: 'cancel'},
        {text: 'Cancel Request', onPress: () => this.rejectRequestHelper(this.state.usersRelationshipID)},
      ],);
    }

    else if (this.state.usersRelationship == 'Add User') {
      Alert.alert('Request User', 'Do you want to send a friend request to ' + this.state.usersName + ' (' + this.state.usersUsername + ')?',
      [
        {text: 'Cancel'},
        {text: 'Send Request', onPress: () => this.sendRequest(this.state.usersID)},
      ],);
    }
  }

  getProfileHelper = (targetID) =>{

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

            Alert.alert('Friends Profile', profile,
            [
              {text: 'Delete Friend', onPress: () => this.removeFriendHelper()},
              {text: 'OK'},
            ],)
          }
          else {
            Alert.alert('Friends Profile', "User has no profile",
            [
              {text: 'Delete Friend', onPress: () => this.removeFriendHelper()},
              {text: 'OK'},
            ],)
          }
        }
        else {
          Alert.alert('Failed to view profile', '' + JSON.stringify(responseJson))
        }
      }
    }

    let onFailure = (error) => {
      Alert.alert('No Internet Connection')
    }

    getProfile(targetID, onSuccess, onFailure)
  }

  acceptRequestHelper = (requestID) =>{
    this.setState({currentlyLoading:true})

    let onSuccess = (responseJson) => {
      if (responseJson !== undefined) {
        if (responseJson.code === undefined || responseJson.code == 200) {
          this.setState({
            usersRelationship: 'Friends',
            usersRelationshipID: responseJson._id,
            currentlyLoading:false
          })
        }
        else {
          this.setState({currentlyLoading:false})
          Alert.alert('Failed to accept request', '' + JSON.stringify(responseJson))
        }
      }
    }

    let onFailure = (error) => {
      Alert.alert('No Internet Connection')
      this.setState({currentlyLoading:false})
    }

    acceptRequest(requestID, onSuccess, onFailure)
  }

  rejectRequestHelper = (requestID) =>{
    this.setState({currentlyLoading:true})

    let onSuccess = (responseJson) => {
      if (responseJson !== undefined) {
        if (responseJson.code === undefined || responseJson.code == 200) {
          this.setState({
            usersRelationship: 'Add User',
            usersRelationshipID: undefined,
            currentlyLoading: false
          })
        }
        else {
          this.setState({currentlyLoading:false})
          Alert.alert('Failed to reject request', '' + JSON.stringify(responseJson))
        }
      }
    }

    let onFailure = (error) => {
      Alert.alert('No Internet Connection')
      this.setState({currentlyLoading:false})
    }

    rejectRequest(requestID, onSuccess, onFailure)
  }

  sendRequest = (requesteeID) =>{
    this.setState({currentlyLoading:true})

    let onSuccess = (responseJson) => {
      if (responseJson !== undefined) {
        if (responseJson.code === undefined || responseJson.code == 200) {
          this.setState({
            usersRelationship: 'Cancel Request',
            usersRelationshipID: responseJson._id,
            currentlyLoading: false
          })
        }
        else {
          this.setState({currentlyLoading:false})
          Alert.alert('Failed to send request', '' + JSON.stringify(responseJson))
        }
      }
    }

    let onFailure = (error) => {
      Alert.alert('No Internet Connection')
      this.setState({currentlyLoading:false})
    }

    requestUser(requesteeID, onSuccess, onFailure)
  }

  removeFriendHelper = () =>{
    this.setState({currentlyLoading:true})

    let onSuccess = (responseJson) => {
      if (responseJson !== undefined) {
        if (responseJson.code === undefined || responseJson.code == 200) {
          this.setState({
            usersRelationship: 'Add User',
            usersRelationshipID: undefined,
            currentlyLoading: false
          })
        }
        else {
          this.setState({currentlyLoading:false})
          Alert.alert('Failed to reject request', '' + JSON.stringify(responseJson))
        }
      }
    }

    let onFailure = (error) => {
      Alert.alert('No Internet Connection')
      this.setState({currentlyLoading:false})
    }

    removeFriend(this.state.usersRelationshipID, onSuccess, onFailure)
  }

  render() {
    return (
      <View>
        <TouchableOpacity style={{backgroundColor: "white"}} onPress={this.rowPressed}>
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
                    <ActivityIndicator size="small" color="#ffb028" /> :
                    <Text style={styles.textFaded}>
                        {this.state.usersRelationship}
                    </Text>}
                </View>
            </View>
        </TouchableOpacity>
        <View
          style={{
            borderBottomColor: 'black',
            borderBottomWidth: 1,
          }}
        />
      </View>
    );
  }
}