import React, { Component } from 'react';
import { Alert, AppRegistry, Button, StyleSheet, View, Image, Text } from 'react-native';
import { createBottomTabNavigator } from 'react-navigation';

const styles = StyleSheet.create({
  container: {
   flex: 1,
   justifyContent: 'space-between',
   alignItems: 'center',
   margin: 20,
   padding: 10
  }
})

export default class Profile extends Component {
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

  render() {
    return (
      <View style={styles.container}>
        <Text style={{fontWeight: 'bold'}}>
            This page will hold all info on your profile
        </Text>
      </View>
    );
  }
}