import React, { Component } from 'react';
import { Alert, StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';

import { acceptRequest, rejectRequest } from './utils/APICalls'
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
})

export default class LandingRequestListItem extends Component {
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
        deleted: false,
    };
  }

  rowPressed = () =>{
    Alert.alert(STRINGS.REQUEST_RESPONSE_ALERT_HEADER, STRINGS.REQUEST_RESPONSE_ALERT_BODY + this.state.userEmail + '?',
    [
        {text: STRINGS.REQUEST_RESPONSE_ALERT_CANCEL, style: 'cancel'},
        {text: STRINGS.REQUEST_RESPONSE_ALERT_REJECT, onPress: () => this.rejectRequestHelper()},
        {text: STRINGS.REQUEST_RESPONSE_ALERT_ACCEPT, onPress: () => this.acceptRequestHelper()},
    ],); 
  }

  acceptRequestHelper = () =>{

    this.setState({
      showLoading: true,
    })

    let onSuccess = (responseJson) => {
      this.setState({
          relationship: STRINGS.FRIENDS,
          relationshipID: responseJson._id,
          expanded: false,
          profileInfo: '',
          showLoading: false,
          deletingUser: false,
      })

      this.props.moveRequest(this.props.item, responseJson._id)
    }

    let onFailure = (error) => {
      this.setState({
        expanded: false,
        profileInfo: '',
        showLoading: false,
        deletingUser: false,
      })
    }

    acceptRequest(this.state.relationshipID, onSuccess, onFailure)
  }

  rejectRequestHelper = () =>{

    this.setState({
        showLoading: true,
    })

    let onSuccess = (responseJson) => {
        this.props.killRequest(this.props.item)
    }

    let onFailure = (error) => {
      this.setState({
        showLoading: false,
        deleted: false,
      })
    }

    rejectRequest(this.state.relationshipID, onSuccess, onFailure)
  }

  render() {
    return (
      <View style={styles.container}>
        {!this.state.deleted && <TouchableOpacity style={{backgroundColor: COLORS.BACKGROUND_COLOR}} onPress={() => this.rowPressed()}>
            <Text style={styles.textBold}>
            {this.state.userName}
            </Text>
            <Text style={styles.textFaded}>
            {this.state.userEmail}
            </Text>
            {this.state.showLoading && <ActivityIndicator size="small" color={COLORS.PRIMARY_COLOR} />}
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
