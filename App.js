import React, { Component } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Button, StyleSheet, View, Image, TextInput, Text } from 'react-native';
import Landing from './src/Landing'
import {createStackNavigator,} from 'react-navigation';
import StatusBarOffset from './src/StatusBarOffset'

const styles = StyleSheet.create({
  container: {
   flex: 1,
   justifyContent: 'space-between',
   alignItems: 'center',
   backgroundColor: 'white',
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
  },
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
      accessToken: '',
      userID: '',
      errorText: '',
      showError: false,
      loading: false,
    };
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
      this.setError("Username too short")
      return
    }

    if (this.state.passwordText.length < 6) {
      this.setError("Password too short")
      return
    }

    if (this.state.status) {
      if (this.state.fullNameText.length < 3) {
        this.setError("Name too short")
        return
      }
      if (this.state.retypePasswordText !== this.state.passwordText) {
        this.setError("Passwords don\'t match")
        return
      }
      this.createUser(this.state.fullNameText, this.state.usernameText, this.state.passwordText);
    } else {
      this.getAccessToken(this.state.usernameText, this.state.passwordText);
    }
  }

  createUser(name, username, password) {
    let self = this;

    fetch('http://192.168.2.25:3030/users', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "name": name,
        "email": username,
        "password": password
      })
    })
    .then((response) => response.json(),
      (error) => this.setError('No Internet Connection'))
    .then((responseJson) => {
      if (responseJson !== undefined) {
        if (responseJson.code === undefined || responseJson.code == 200) {
          self.getAccessToken(username, password) 
        }
        else {
          this.setError('Username is taken')
        }
      }
    })
    .catch((error) => {
      console.error(error);
    });
  }

  getAccessToken(username, password) {
    let self = this

    fetch('http://192.168.2.25:3030/authentication', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "strategy": "local",
        "email": username,
        "password": password
      })
    })
    .then((response) => response.json(),
      (error) => this.setError('No Internet Connection'))
    .then((responseJson) => {
      if (responseJson !== undefined) {
        if (responseJson.code === undefined || responseJson.code == 200) {
          self.state.accessToken = responseJson.accessToken
          self.getUserInfo(username)
        }
        else {
          this.setError('Invalid login details')
        }
      }
    })
    .catch((error) => {
      console.error(error);
    });
  }

  getUserInfo(username) {
    let self = this;

    fetch('http://192.168.2.25:3030/users?email=' + username, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + self.state.accessToken
      }
    })
    .then((response) => response.json(),
      (error) => this.setError('No Internet Connection'))
    .then((responseJson) => {
      if (responseJson !== undefined) {
        if (responseJson.code === undefined || responseJson.code == 200) {
          self.state.userID = responseJson.data[0]._id
          self.state.fullNameText = responseJson.data[0].name
          this.props.navigation.navigate('landing', {
            userID: self.state.userID, 
            username: this.state.usernameText,
            name: this.state.fullNameText,
            accessToken: this.state.accessToken
          });
        }
        else {
          this.setError('Failed to get user details')
        }
      }
    })
    .catch((error) => {
      console.error(error);
    });
  }

  ShowHideTextComponentView = () =>{
    if(this.state.status) {
      this.setState({status: false})
    }
    else {
      this.setState({status: true})
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <KeyboardAvoidingView style={styles.container} behavior="position" enabled>
          <View>
            <StatusBarOffset />
            <Image 
              source={require('./assets/logo.png')} 
              style={{width: 200, height: 200}} 
            />
          </View>
          <View style={styles.closeContainer}>
            {this.state.showError && <Text
              style={{textAlign: 'center',}}>
              {this.state.errorText}
            </Text>}
            { this.state.status &&
              <TextInput 
                style={styles.textStyle} 
                placeholder= 'Full Name'
                autoCapitalize='words'
                autoCorrect={false}
                returnKeyType = { "next" }
                onSubmitEditing={() => { this.nameTextInput.focus(); }}
                blurOnSubmit={false}
                underlineColorAndroid={'#ffb028'}
                maxLength={100}
                onChangeText={(text) => this.setState({fullNameText: text})}
              />
            }
            <TextInput
              style={styles.textStyle}
              ref={(input) => { this.nameTextInput = input; }}
              placeholder="Username"
              autoCapitalize='none'
              returnKeyType={"next"}
              onSubmitEditing={() => { this.passwordTextInput.focus(); }}
              blurOnSubmit={false}
              underlineColorAndroid={'#ffb028'}
              maxLength={50}
              onChangeText={(text) => this.setState({usernameText: text})}
            />
            <TextInput
              style={styles.textStyle}
              ref={(input) => { this.passwordTextInput = input; }}
              placeholder="Password"
              autoCapitalize='none'
              returnKeyType={this.state.status ? "next" : "go"}
              onSubmitEditing={this.state.status ? () => { this.retypePasswordTextInput.focus(); } : this.signUpClick}
              blurOnSubmit={!this.state.status}
              secureTextEntry={true}
              underlineColorAndroid={'#ffb028'}
              maxLength={50}
              onChangeText={(text) => this.setState({passwordText: text})}
            />
            { this.state.status &&
              <TextInput
                style={styles.textStyle}
                ref={(input) => { this.retypePasswordTextInput = input; }}
                placeholder="Retype Password"
                autoCapitalize='none'
                returnKeyType={"go"}
                onSubmitEditing={this.signUpClick}
                secureTextEntry={true}
                underlineColorAndroid={'#ffb028'}
                maxLength={50}
                onChangeText={(text) => this.setState({retypePasswordText: text})}
                />
              }
              {this.state.loading ? 
              <ActivityIndicator size="large" color="#ffb028" /> : 
              <Button
                onPress={this.signUpClick}
                title={this.state.status ? "Sign Up" : "Login"}
                color="#ffb028"
              />}
            </View>
          </KeyboardAvoidingView>
          <View>
            {!this.state.loading && <Button
              onPress={this.ShowHideTextComponentView}
              title={this.state.status ? "I Already Have an Account" : "I Don\'t Have an Account"}
              color="#ffb028"
            />}
            <StatusBarOffset />
          </View>
      </View>
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
