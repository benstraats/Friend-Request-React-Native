import React, { Component } from 'react';
import { Alert, StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, Button, } from 'react-native';

import { getProfile, removeFriend } from './utils/APICalls'
import { COLORS, STRINGS } from './utils/ProjectConstants'

const styles = StyleSheet.create({
  container: {
   flex: 1,
   backgroundColor: COLORS.BACKGROUND_COLOR,
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

export default class LandingFriendListItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
        userID: this.props.item.userID,
        userName: this.props.item.userName,
        userEmail: this.props.item.userEmail,
        relationship: this.props.item.relationship,
        relationshipID: this.props.item.relationshipID,
        expanded: this.props.item.expanded,
        profileInfo: this.props.item.profileInfo,
        showLoading: this.props.item.showLoading,
        deletingUser: this.props.item.deletingUser,
        delete: false,
    };
  }

  rowPressed = () => {

    if (!this.state.deletingUser) {
        this.setState({
            showLoading: !this.state.expanded,
            expanded: !this.state.expanded,
        }, () => {
            if (this.state.expanded) {
                this.getProfileHelper();
            }
        })
    }
  }

  getProfileHelper = () => {

    this.setState({
        showLoading: true,
    })

    let onSuccess = (responseJson) => {

      if (responseJson === undefined) {
        this.getProfileHelper()
      }

      else if (responseJson.code === undefined || responseJson.code == 200) {
        var profile = ''

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

        this.setState({
            profileInfo: profile,
            showLoading: false,
        })
      }
      else {
        //bad response
      }
    }

    let onFailure = (error) => {
      //fatal error
    }

    getProfile(this.state.userID, onSuccess, onFailure)
  }

  removeFriendHelper = () =>{
    this.setState({
        deletingUser: true,
        showLoading: true,
        deleted: true,
    })

    let onSuccess = (responseJson) => {

      if (responseJson === undefined) {
        this.removeFriendHelper()
      }
      else if (responseJson.code === undefined || responseJson.code == 200) {
        this.props.killFriend(this.props.item)
      }
      else {
        //response error
        this.setState({
            showLoading: false,
            deletingUser: false
        })
      }
    }

    let onFailure = (error) => {
      //fatal error
    }

    removeFriend(this.state.relationshipID, onSuccess, onFailure)
  }

  deleteFriendAlert = () => {
    Alert.alert(STRINGS.DELETE_FRIEND_ALERT_HEADER, STRINGS.DELETE_FRIEND_ALERT_BODY + this.state.userName + '?',
      [
        {text: STRINGS.DELETE_FRIEND_ALERT_CANCEL, style: 'cancel'},
        {text: STRINGS.DELETE_FRIEND_ALERT_ACCEPT, onPress: () => this.removeFriendHelper()},
      ],);
  }

  render() {
    return (
      <View style={styles.container}>
        {!this.state.deleted && <TouchableOpacity style={{backgroundColor: COLORS.BACKGROUND_COLOR}} onPress={this.rowPressed.bind(this)}>
            <Text style={styles.textBold}>
            {this.state.userName}
            </Text>
            <Text style={styles.textFaded}>
            {this.state.userEmail}
            </Text>
            {this.state.showLoading && <ActivityIndicator size="small" color={COLORS.PRIMARY_COLOR} />}
            {this.state.expanded &&
            <View>
                <Text style={styles.profileText}>{this.state.profileInfo}</Text>
                {!this.state.deletingUser &&
                <View style={styles.deleteButton}>
                    <Button
                    onPress={() => this.deleteFriendAlert()}//maybe have to add .bind(this)
                    title={STRINGS.DELETE_FRIEND}
                    color={COLORS.PRIMARY_COLOR}
                    />
                </View>
                }
            </View>
            }
            <View
                style={{
                borderBottomColor: COLORS.ROW_BORDER,
                borderBottomWidth: 1,
                }}
            />
        </TouchableOpacity> }
      </View>
    );
  }
}
