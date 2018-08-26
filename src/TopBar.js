import React, {Component} from 'react';
import {View, StyleSheet, Text} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {COLORS, STRINGS} from './utils/ProjectConstants'

export default class StatusBarOffset extends Component{

  backPressed = () => {
    //unsure if this works
    this.props.navigation.goBack(null)
  }

  logOutPressed = () => {

  }

  render(){
    return(
        <View style={styles.statusBarBackground}>
          {this.props.mainText !== STRINGS.HOME ? 
            <View style={styles.textViewStyle}>
              <Ionicons
                name={'ios-arrow-back'}
                size={24}
                style={styles.backIconStyle}
                onIconClicked={() => this.backPressed()}
                onPress={() => this.backPressed()}
                />
              <Text style={styles.textStyle}>
                {this.props.mainText}
              </Text>
              {this.props.mainText !== STRINGS.PROFILE ? 
                <Text style={styles.offsetStyle}></Text> : 
                <Ionicons
                  name={'ios-log-out'}
                  size={24}
                  style={styles.logoutIconStyle}
                  onIconClicked={() => this.logOutPressed()}
                  onPress={() => this.logOutPressed()}
                  />
              }
            </View> :
            <View style={styles.soloText}>
              <Text style={styles.textStyle}>{this.props.mainText}</Text>
            </View>
          }
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
  backIconStyle: {
    paddingLeft:10,
  },
  logoutIconStyle: {
    paddingRight: 10,
  },
  offsetStyle: {
    paddingRight:20
  },
  soloText: {
    flexDirection: 'row',
    justifyContent: 'center',
  }
})