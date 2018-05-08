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

export default class Search extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={{fontWeight: 'bold'}}>
            This page will be to search users
        </Text>
      </View>
    );
  }
}