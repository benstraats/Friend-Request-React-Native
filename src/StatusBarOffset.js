import React, {Component} from 'react';
import {View, Platform} from 'react-native';
import {COLORS} from './utils/ProjectConstants'

export default class StatusBarOffset extends Component{
  render(){
    return(
      <View style={{
        height: this.props.overrideHeight !== undefined ? this.props.overrideHeight : Platform.OS === 'ios' ? 28 : 4,
        backgroundColor: COLORS.BACKGROUND_COLOR,
        }}>
      </View>
    );
  }
}