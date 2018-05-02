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

  signUpClick() {
    Alert.alert('Signing up!')
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
        <TextInput 
          style={{height: 40, width: 200}} 
          placeholder= 'Full Name'
        />
        <TextInput
          style={{height: 40, width: 200}}
          placeholder="Username"
        />
        <TextInput
          style={{height: 40, width: 200}}
          placeholder="Password"
        />
        <TextInput
          style={{height: 40, width: 200}}
          placeholder="Retype Password"
        />
        <Button
          onPress={this.signUpClick}
          title="Sign Up"
          color="#ffb028"
        />
        <Button
          onPress={this.ShowHideTextComponentView}
          title="I Already Have an Account"
          color="#ffb028"
        />
      </View>
    );
  }
}
