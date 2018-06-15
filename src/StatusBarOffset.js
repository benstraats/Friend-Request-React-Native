import React, {Component} from 'react';
import {View, StyleSheet, Platform} from 'react-native';

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
    height: Platform.OS === 'ios' ? 20 : 24,
    backgroundColor: "white",
  }
})