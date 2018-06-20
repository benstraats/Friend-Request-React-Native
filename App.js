import React, { Component } from 'react';
import { Alert, KeyboardAvoidingView, Button, StyleSheet, View, Image, TextInput } from 'react-native';
import Landing from './src/Landing'
import {createStackNavigator,} from 'react-navigation';
import StatusBarOffset from './src/StatusBarOffset'

const styles = StyleSheet.create({
  container: {
   flex: 1,
   justifyContent: 'space-between',
   alignItems: 'center',
  },
  closeContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
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
      accessToken: '',
      userID: ''
    };
  }

  signUpClick = () =>{

    if (this.state.usernameText.length < 3) {
      Alert.alert("Username too short")
      return
    }

    if (this.state.passwordText.length < 6) {
      Alert.alert("Password too short")
      return
    }

    if (this.state.status) {
      if (this.state.fullNameText.length < 3) {
        Alert.alert("Name too short")
        return
      }
      if (this.state.retypePasswordText !== this.state.passwordText) {
        Alert.alert("Passwords don\'t match")
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
      (error) => Alert.alert('No Internet Connection'))
    .then((responseJson) => {
      if (responseJson !== undefined) {
        if (responseJson.code === undefined || responseJson.code == 200) {
          self.getAccessToken(username, password) 
        }
        else {
          Alert.alert('Failed to signup', '' + JSON.stringify(responseJson))
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
      (error) => Alert.alert('No Internet Connection'))
    .then((responseJson) => {
      if (responseJson !== undefined) {
        if (responseJson.code === undefined || responseJson.code == 200) {
          self.state.accessToken = responseJson.accessToken
          self.getUserInfo(username)
        }
        else {
          Alert.alert('Failed to login', '' + JSON.stringify(responseJson))
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
      (error) => Alert.alert('No Internet Connection'))
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
          Alert.alert('Failed to get user details', '' + JSON.stringify(responseJson))
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
              { this.state.status &&
                <TextInput 
                  style={{height: 40, width: 200}} 
                  placeholder= 'Full Name'
                  autoCapitalize='words'
                  autoCorrect={false}
                  returnKeyType='next'
                  underlineColorAndroid={'#ffb028'}
                  maxLength={100}
                  onChangeText={(text) => this.setState({fullNameText: text})}
                />
              }
              <TextInput
                style={{height: 40, width: 200}}
                placeholder="Username"
                autoCapitalize='none'
                returnKeyType='next'
                underlineColorAndroid={'#ffb028'}
                maxLength={50}
                onChangeText={(text) => this.setState({usernameText: text})}
              />
              <TextInput
                style={{height: 40, width: 200}}
                placeholder="Password"
                autoCapitalize='none'
                returnKeyType='next'
                secureTextEntry={true}
                underlineColorAndroid={'#ffb028'}
                maxLength={50}
                onChangeText={(text) => this.setState({passwordText: text})}
              />
              { this.state.status &&
                <TextInput
                  style={{height: 40, width: 200}}
                  placeholder="Retype Password"
                  autoCapitalize='none'
                  returnKeyType='go'
                  secureTextEntry={true}
                  underlineColorAndroid={'#ffb028'}
                  maxLength={50}
                  onChangeText={(text) => this.setState({retypePasswordText: text})}
                />
              }
              <Button
                onPress={this.signUpClick}
                title={this.state.status ? "Sign Up" : "Login"}
                color="#ffb028"
              />
            </View>
          </KeyboardAvoidingView>
          <View>
            <Button
              onPress={this.ShowHideTextComponentView}
              title={this.state.status ? "I Already Have an Account" : "I Don\'t Have an Account"}
              color="#ffb028"
            />
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
