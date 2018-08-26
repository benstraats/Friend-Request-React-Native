import React, {Component} from 'react';
import {View, StyleSheet, Text} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {COLORS, STRINGS} from './utils/ProjectConstants'

export default class StatusBarOffset extends Component{
  render(){
    return(
        <View style={styles.statusBarBackground}>
          {this.props.mainText !== STRINGS.HOME ? <View style={styles.textViewStyle}>
            <Ionicons
              name={'ios-arrow-back'}
              size={24}
              style={styles.iconStyle}
            />
            <Text style={styles.textStyle}>
              {this.props.mainText}
            </Text>
            <Text style={styles.offsetStyle}>
              
            </Text>
          </View> :
          <View style={styles.soloText}>
            <Text style={styles.textStyle}>{this.props.mainText}</Text>
            </View>}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textStyle: {
    fontSize: 24,
    alignItems: 'center',
  },
  iconStyle: {
    paddingLeft:10,
  },
  offsetStyle: {
    paddingRight:20
  },
  soloText: {
    flexDirection: 'row',
    justifyContent: 'center',
  }
})