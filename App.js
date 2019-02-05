import React, { Component } from 'react';
import { TouchableWithoutFeedback, Keyboard, ActivityIndicator, KeyboardAvoidingView, Button, StyleSheet, View, Image, TextInput, Text } from 'react-native';
import {createStackNavigator,} from 'react-navigation';
import * as Keychain from 'react-native-keychain';
import PushNotification from 'react-native-push-notification';

import Landing from './src/Landing'
import StatusBarOffset from './src/StatusBarOffset'
import {createUser, getAccessToken, getUserInfo, postNotificationToken} from './src/utils/APICalls'
import {COLORS, STRINGS} from './src/utils/ProjectConstants'

const styles = StyleSheet.create({
  container: {
   flex: 1,
   justifyContent: 'space-between',
   alignItems: 'center',
   backgroundColor: COLORS.BACKGROUND_COLOR,
  },
  closeContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textStyle: {
    height: 40,
    width: 200,
    paddingLeft: 5,
    paddingRight: 5,
  },
  errorText: {
    color: COLORS.TEXT_COLOR,
    textAlign: 'center',
  }
})

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fullNameText: '', 
      usernameText: '', 
      passwordText: '', 
      retypePasswordText: '', 
      status: true,
      errorText: '',
      showError: false,
      loading: false,
      keyBoardOpen: false,
      registerToken: undefined, 
      gcmRegistered: false,
    };

    this.load()
  }

  onRegister(token) {
    let onSuccess = (responseJson) => {
    }

    let onFailure = (error) => {
      //this is commented out because api throws error if token is already saved for user
      //postNotificationToken(token.token)
    }

    postNotificationToken(token.token, onSuccess, onFailure)
  }

  onNotification(token) {
    //Do we need to handle this in some way?
  }


  async load() {
    try {
      const credentials = await Keychain.getGenericPassword();

      if (credentials) {
        this.setState({
          usernameText: credentials.username,
          passwordText: credentials.password,
          loading: true,
          status: false,
        })
        this.getAccessTokenHelper(credentials.username, credentials.password)
      } else {
      }
    } catch(error) {
    }
  }

  async save(username, password) {
    await Keychain.setGenericPassword(username, password)
  }

  async reset() {
    await Keychain.resetGenericPassword()
  }

  setError = (error) => {
    this.setState({
      errorText: error,
      showError: true,
      loading: false,
    })
  }

  signUpClick = () =>{

    this.setState({
      showError: false,
      loading: true,
    })

    if (this.state.usernameText.length < 3) {
      this.setError(STRINGS.USERNAME_TOO_SHORT)
      return
    }

    if (this.state.passwordText.length < 6) {
      this.setError(STRINGS.PASSWORD_TOO_SHORT)
      return
    }

    if (this.state.status) {
      if (this.state.fullNameText.length < 3) {
        this.setError(STRINGS.NAME_TOO_SHORT)
        return
      }
      if (this.state.retypePasswordText !== this.state.passwordText) {
        this.setError(STRINGS.PASSWORDS_DONT_MATCH)
        return
      }
      Keyboard.dismiss();
      this.createUserHelper(this.state.fullNameText, this.state.usernameText, this.state.passwordText);
    } else {
      Keyboard.dismiss();
      this.getAccessTokenHelper(this.state.usernameText, this.state.passwordText);
    }
  }

  createUserHelper(name, username, password) {
    let onSuccess = (responseJson) => {

      if (responseJson === undefined) {
        //no response
        this.setError(STRINGS.NO_INTERNET)
        this.setState({
          loading: false,
        })
      }
      else if (responseJson.code === undefined || responseJson.code == 200) {
        //valid response
        this.getAccessTokenHelper(username, password) 
      }
      else {
        //failure from server
        this.setError(responseJson.message)
        this.setState({
          loading: false,
        })
      }
    }

    let onFailure = (error) => {
      //fatal error
      this.setError(STRINGS.UNKNOWN_ERROR)
      this.setState({
        loading: false,
      })
    }

    createUser(name, username, password, onSuccess, onFailure)
  }

  getAccessTokenHelper(username, password) {
    let onSuccess = (responseJson) => {
      this.save(username, password)

      this.getUserInfoHelper(username)
    }

    let onFailure = (error) => {
      this.reset()
      this.setError(error.message)
      this.setState({
        loading: false,
      })
    }

    getAccessToken(username, password, onSuccess, onFailure)
  }

  getUserInfoHelper = (username) => {
    let onSuccess = (responseJson) => {
      PushNotification.configure({
        // (optional) Called when Token is generated (iOS and Android)
        onRegister: this.onRegister.bind(this),
        onNotification: this.onNotification,
  
        // ANDROID ONLY: GCM Sender ID (optional - not required for local notifications, but is need to receive remote push notifications)
        senderID: 'REDACTED',
  
        // IOS ONLY (optional): default: all - Permissions to register.
        permissions: {
          alert: true,
          badge: true,
          sound: true
        },
  
        // Should the initial notification be popped automatically
        // default: true
        popInitialNotification: true,
        requestPermissions: true,
      });
  
      this.setState({
        loading: false,
      })
      this.props.navigation.navigate('landing', {
        userID: responseJson.data[0]._id,
        username: this.state.usernameText,
        name: responseJson.data[0].name,
      });
    }

    let onFailure = (error) => {
      this.reset()
      this.setError(error.message)
      this.setState({
        loading: false,
      })
    }

    getUserInfo(username, onSuccess, onFailure)
  }

  ShowHideTextComponentView = () =>{
    if(this.state.status) {
      this.setState({status: false})
    }
    else {
      this.setState({status: true})
    }
  }

  componentDidMount () {
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow.bind(this));
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide.bind(this));

  }

  componentWillUnmount () {
    this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener.remove();
  }

  _keyboardDidShow () {
    this.setState({
      keyBoardOpen: true,
    })
  }

  _keyboardDidHide () {
    this.setState({
      keyBoardOpen: false,
    })
  }

  render() {
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.container}>
          <StatusBarOffset />
          {!this.state.keyBoardOpen && 
            <View>
              <Image 
                source={require('./assets/logo.png')} 
                style={{width: 200, height: 200, paddingTop: 40}} 
              />
            </View>
          }
          <KeyboardAvoidingView style={styles.closeContainer}>
            {this.state.showError && <Text
              style={styles.errorText}>
              {this.state.errorText}
            </Text>}
            { this.state.status &&
              <TextInput 
                style={styles.textStyle} 
                placeholder= {STRINGS.FULL_NAME}
                autoCapitalize='words'
                autoCorrect={false}
                returnKeyType = { "next" }
                onSubmitEditing={() => { this.nameTextInput.focus(); }}
                blurOnSubmit={false}
                underlineColorAndroid={COLORS.PRIMARY_COLOR}
                maxLength={100}
                onChangeText={(text) => this.setState({fullNameText: text})}
              />
            }
            <TextInput
              style={styles.textStyle}
              ref={(input) => { this.nameTextInput = input; }}
              placeholder={STRINGS.USERNAME}
              autoCapitalize='none'
              returnKeyType={"next"}
              onSubmitEditing={() => { this.passwordTextInput.focus(); }}
              blurOnSubmit={false}
              underlineColorAndroid={COLORS.PRIMARY_COLOR}
              maxLength={50}
              onChangeText={(text) => this.setState({usernameText: text})}
            />
            <TextInput
              style={styles.textStyle}
              ref={(input) => { this.passwordTextInput = input; }}
              placeholder={STRINGS.PASSWORD}
              autoCapitalize='none'
              returnKeyType={this.state.status ? "next" : "go"}
              onSubmitEditing={this.state.status ? () => { this.retypePasswordTextInput.focus(); } : this.signUpClick}
              blurOnSubmit={!this.state.status}
              secureTextEntry={true}
              underlineColorAndroid={COLORS.PRIMARY_COLOR}
              maxLength={50}
              onChangeText={(text) => this.setState({passwordText: text})}
            />
            { this.state.status &&
              <TextInput
                style={styles.textStyle}
                ref={(input) => { this.retypePasswordTextInput = input; }}
                placeholder={STRINGS.RETYPE_PASSWORD}
                autoCapitalize='none'
                returnKeyType={"go"}
                onSubmitEditing={this.signUpClick}
                secureTextEntry={true}
                underlineColorAndroid={COLORS.PRIMARY_COLOR}
                maxLength={50}
                onChangeText={(text) => this.setState({retypePasswordText: text})}
                />
              }
              {this.state.loading ? 
              <ActivityIndicator size="large" color={COLORS.PRIMARY_COLOR} /> : 
              <Button
                onPress={this.signUpClick}
                title={this.state.status ? STRINGS.SIGN_UP : STRINGS.LOGIN}
                color={COLORS.PRIMARY_COLOR}
              />}
            </KeyboardAvoidingView>
            {!this.state.keyBoardOpen && 
              <View>
                {!this.state.loading && 
                  <Button
                    onPress={this.ShowHideTextComponentView}
                    title={this.state.status ? STRINGS.ALREADY_HAVE_ACCOUNT : STRINGS.DONT_HAVE_ACCOUNT}
                    color={COLORS.PRIMARY_COLOR}
                  />
                }
                <StatusBarOffset overrideHeight={15} />
              </View>
            }
        </View>
      </TouchableWithoutFeedback>
    );
  }
}

export default Project = createStackNavigator({
   login: { screen: Login },
   landing: { screen: Landing }
  },
  {
    navigationOptions:{ 
      header: null 
    }
  }
);
