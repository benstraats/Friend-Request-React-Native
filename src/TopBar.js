import React, {Component} from 'react';
import {Alert, View, StyleSheet, Text} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as Keychain from 'react-native-keychain';

import {COLORS, STRINGS} from './utils/ProjectConstants'
import StatusBarOffset from './StatusBarOffset'
import {deleteNotificationToken} from './utils/APICalls'

export default class TopBar extends Component{

  backPressed = () => {
    //unsure if this works
    this.props.navigation.goBack(null)
  }

  logOutPressed = () => {
    Alert.alert(STRINGS.LOGOUT_ALERT_HEADER, STRINGS.LOGOUT_ALERT_BODY,
      [
        {text: STRINGS.LOGOUT_ALERT_CANCEL, style: 'cancel'},
        {text: STRINGS.LOGOUT_ALERT_CONFIRM, onPress: () => this.logUserOut()},
      ],);
  }

  async reset() {
    await Keychain.resetGenericPassword()
  }

  logUserOut = () => {
    this.reset()
    this.props.navigation.goBack(null)
    this.props.navigation.goBack(null)

    let onSuccess = (responseJson) => {
    }

    let onFailure = (error) => {
    }

    deleteNotificationToken(onSuccess, onFailure)
  }

  render(){
    return(
      <View>
        <StatusBarOffset />
        <View style={styles.statusBarBackground}>
          {this.props.mainText !== STRINGS.HOME ? 
            <View style={styles.textViewStyle}>
              <Ionicons
                name={'ios-arrow-back'}
                size={24}
                style={styles.backIconStyle}
                onIconClicked={() => this.backPressed()}
                onPress={() => this.backPressed()}
                />
              <Text style={styles.textStyle}>
                {this.props.mainText}
              </Text>
              {this.props.mainText !== STRINGS.PROFILE ? 
                <Text style={styles.offsetStyle}></Text> : 
                <Ionicons
                  name={'ios-log-out'}
                  size={24}
                  style={styles.logoutIconStyle}
                  onIconClicked={() => this.logOutPressed()}
                  onPress={() => this.logOutPressed()}
                  />
              }
            </View> :
            <View style={styles.soloText}>
              <Text style={styles.textStyle}>{this.props.mainText}</Text>
            </View>
          }
          <View style={styles.blankBuffer}>
        </View>
          <View
            style={{
              borderBottomColor: 'black',
              borderBottomWidth: 1,
            }}
            />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  statusBarBackground: {
    backgroundColor: COLORS.BACKGROUND_COLOR,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'stretch',
  },
  textViewStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textStyle: {
    fontSize: 24,
    alignItems: 'center',
    color: COLORS.TEXT_COLOR
  },
  backIconStyle: {
    paddingLeft:10,
    color: COLORS.TEXT_COLOR
  },
  logoutIconStyle: {
    paddingRight: 10,
    color: COLORS.TEXT_COLOR
  },
  offsetStyle: {
    paddingRight:20
  },
  soloText: {
    flexDirection: 'row',
    justifyContent: 'center',
    color: COLORS.TEXT_COLOR
  },
})