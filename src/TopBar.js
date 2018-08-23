import React, {Component} from 'react';
import {View, StyleSheet, Text} from 'react-native';

export default class StatusBarOffset extends Component{
  render(){
    return(
        <View style={styles.statusBarBackground}>
          <View style={styles.textViewStyle}>
            <Text style={styles.textStyle}>
              {this.props.mainText}
            </Text>
          </View>
            <View
              style={{
                borderBottomColor: 'black',
                borderBottomWidth: 1,
              }}
            />
        </View>
    );
  }
}

const styles = StyleSheet.create({
  statusBarBackground: {
    backgroundColor: "white",
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'stretch',
  },
  textViewStyle: {
    alignItems: 'center',
  },
  textStyle: {
    fontSize: 24,
  }
})