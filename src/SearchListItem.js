import React, { Component } from 'react';
import { Alert, StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';

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
      accessToken: this.props.accessToken,
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
      this.viewProfile(this.state.usersID)
    }

    else if (this.state.usersRelationship == 'Accept Request') {
      Alert.alert('Accept Request', 'Do you want to accept the friend request from ' + this.state.usersName + ' (' + this.state.usersUsername + ')?',
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Reject', onPress: () => this.rejectRequest(this.state.usersRelationshipID)},
        {text: 'Accept', onPress: () => this.acceptRequest(this.state.usersRelationshipID)},
      ],);
      
    }

    else if (this.state.usersRelationship == 'Cancel Request') {
      Alert.alert('Cancel Request', 'Do you want to cancel the friend request to ' + this.state.usersName + ' (' + this.state.usersUsername + ')?',
      [
        {text: 'Don\'t Cancel', style: 'cancel'},
        {text: 'Cancel Request', onPress: () => this.rejectRequest(this.state.usersRelationshipID)},
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

  viewProfile = (targetID) =>{
    let self = this;

    fetch('http://192.168.2.25:3030/profile?userID=' + targetID, {
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

            Alert.alert('Friends Profile', profile,
            [
              {text: 'Delete Friend', onPress: () => this.removeFriend()},
              {text: 'OK'},
            ],)
          }
          else {
            Alert.alert('Friends Profile', "User has no profile",
            [
              {text: 'Delete Friend', onPress: () => this.removeFriend()},
              {text: 'OK'},
            ],)
          }
        }
        else {
          Alert.alert('Failed to view profile', '' + JSON.stringify(responseJson))
        }
      }
    })
    .catch((error) => {
      console.error(error);
    });
  }

  acceptRequest = (requestID) =>{
    let self = this;

    this.setState({currentlyLoading:true})

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
      (error) => {Alert.alert('No Internet Connection')
      this.setState({currentlyLoading:false})
    }).then((responseJson) => {
      if (responseJson !== undefined) {
        if (responseJson.code === undefined || responseJson.code == 200) {
          self.setState({
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
    })
    .catch((error) => {
      console.error(error);
    });
  }

  rejectRequest = (requestID) =>{
    let self = this;
    this.setState({currentlyLoading:true})

    fetch('http://192.168.2.25:3030/requests/' + requestID, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + self.state.accessToken
      },
    })
    .then((response) => response.json(),
      (error) => {Alert.alert('No Internet Connection')
      this.setState({currentlyLoading:false})
    }).then((responseJson) => {
      if (responseJson !== undefined) {
        if (responseJson.code === undefined || responseJson.code == 200) {
          self.setState({
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
    })
    .catch((error) => {
      console.error(error);
    });
  }

  sendRequest = (requesteeID) =>{
    let self = this;
    this.setState({currentlyLoading:true})

    fetch('http://192.168.2.25:3030/requests', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + self.state.accessToken
      },
      body: JSON.stringify({
        "requesteeID": requesteeID
      })
    })
    .then((response) => response.json(),
      (error) => {Alert.alert('No Internet Connection')
      this.setState({currentlyLoading:false})
    }).then((responseJson) => {
      if (responseJson !== undefined) {
        if (responseJson.code === undefined || responseJson.code == 200) {
          self.setState({
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
    })
    .catch((error) => {
      console.error(error);
    });
  }

  removeFriend = () =>{

    let self = this;
    let friendID = this.state.usersRelationshipID
    this.setState({currentlyLoading:true})

    fetch('http://192.168.2.25:3030/friends/' + friendID, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + self.state.accessToken
      },
    })
    .then((response) => response.json(),
      (error) => {Alert.alert('No Internet Connection')
      this.setState({currentlyLoading:false})})
    .then((responseJson) => {
      if (responseJson !== undefined) {
        if (responseJson.code === undefined || responseJson.code == 200) {
          self.setState({
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
    })
    .catch((error) => {
      console.error(error);
    });
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