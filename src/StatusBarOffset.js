import React, {Component} from 'react';
import {View, Text, StyleSheet, Platform} from 'react-native';

export default class StatusBarOffset extends Component{
  render(){
    return(
      <View style={styles.statusBarBackground}>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  statusBarBackground: {
    height: 25,
    backgroundColor: "white",
  }

})