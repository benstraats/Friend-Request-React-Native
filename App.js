import React, { Component } from 'react';
import { Alert, AppRegistry, Button, StyleSheet, View, Image, TextInput } from 'react-native';

const styles = StyleSheet.create({
  container: {
   flex: 1,
   justifyContent: 'space-between',
   alignItems: 'center',
   margin: 20,
   padding: 10
  }
})

export default class Bananas extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fullNameText: '', 
      usernameText: '', 
      passwordText: '', 
      retypePasswordText: '', 
      status: true
    };
  }

  signUpClick = () =>{
    if (this.state.status) {
      Alert.alert('Signing up with creds:',
        'Full Name: ' + this.state.fullNameText + '\n' +
        'Username: ' + this.state.usernameText + '\n' +
        'Password: ' + this.state.passwordText + '\n' +
        'Retype Password: ' + this.state.retypePasswordText);
    } else {
      Alert.alert('Logging in with creds:',
      'Username: ' + this.state.usernameText + '\n' +
      'Password: ' + this.state.passwordText);
    }
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
        <Image 
          source={require('./assets/logo.png')} 
          style={{width: 200, height: 200}} 
        />
        { this.state.status &&
          <TextInput 
            style={{height: 40, width: 200}} 
            placeholder= 'Full Name'
            onChangeText={(text) => this.setState({fullNameText: text})}
          />
        }
        <TextInput
          style={{height: 40, width: 200}}
          placeholder="Username"
          onChangeText={(text) => this.setState({usernameText: text})}
        />
        <TextInput
          style={{height: 40, width: 200}}
          placeholder="Password"
          onChangeText={(text) => this.setState({passwordText: text})}
        />
        { this.state.status &&
          <TextInput
            style={{height: 40, width: 200}}
            placeholder="Retype Password"
            onChangeText={(text) => this.setState({retypePasswordText: text})}
          />
        }
        <Button
          onPress={this.signUpClick}
          title={this.state.status ? "Sign Up" : "Login"}
          color="#ffb028"
        />
        <Button
          onPress={this.ShowHideTextComponentView}
          title={this.state.status ? "I Already Have an Account" : "I Don\'t Have an Account"}
          color="#ffb028"
        />
      </View>
    );
  }
}
