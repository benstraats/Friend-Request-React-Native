import React, { Component } from 'react';
import { Alert, AppRegistry, Button, StyleSheet, View, Image, Text } from 'react-native';
import { createBottomTabNavigator } from 'react-navigation';

import Search from './Search'
import Profile from './Profile'

const styles = StyleSheet.create({
  container: {
   flex: 1,
   justifyContent: 'space-between',
   alignItems: 'center',
   margin: 20,
   padding: 10
  }
})

class Landing extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userID: this.props.navigation.state.params.userID,
      fullNameText: this.props.navigation.state.params.name, 
      usernameText: this.props.navigation.state.params.username, 
      accessToken: this.props.navigation.state.params.accessToken,
    };
  }

  showUserInfo = () =>{
    Alert.alert("Info", 
      "UserID: " + this.state.userID +
      "\nUsername: " + this.state.usernameText + 
      "\nFull Name: " + this.state.fullNameText +
      "\nAccess Token: " + this.state.accessToken);
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={{fontWeight: 'bold'}}>
            This page will hold all your info on your current and pending friends.
        </Text>
        <Button
          onPress={this.showUserInfo}
          title={"Show User Info"}
          color="#ffb028"
        />
      </View>
    );
  }
}

export default createBottomTabNavigator(
  {
    Landing: { screen: Landing },
    Search: { screen: Search },
    Profile: { screen: Profile },
  },
  {
    tabBarOptions: 
    {
      activeTintColor: 'white',
      inactiveTintColor: '#ffb028',
      activeBackgroundColor: '#ffb028',
      inactiveBackgroundColor: 'white',
      labelStyle: {
        fontSize: 30,
        justifyContent: 'center',
        alignItems: 'center',
      },
      animationEnabled: true,
      swipeEnabled: true,
    }
  },
);