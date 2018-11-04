import React, { Component } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import {COLORS, STRINGS} from './utils/ProjectConstants'

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.BACKGROUND_COLOR,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'stretch',
  },
  textViewStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 8,
    color: COLORS.TEXT_COLOR
  },
  touchableStyle: {
    borderBottomColor: COLORS.ROW_BORDER,
    borderBottomWidth: 1,
    flexDirection: 'row',
  },
})

export default class LandingHeaderListItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      title: this.props.title,
      loading: this.props.loading,
      requestTotal: this.props.requestTotal,
      expanded: this.props.expanded,
    };
  }

  headerPress = () => {
    if (this.state.title.indexOf(STRINGS.REQUEST_SECTION_HEADER) != -1) {
      this.props.toggleRequestVisibility();
      this.setState({expanded: !this.state.expanded})
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.touchableStyle}
          onPress={this.headerPress.bind(this)}>
          {this.state.title === STRINGS.FRIEND_SECTION_HEADER ? 
          <Text style={styles.sectionHeader}>
            {this.state.title}
          </Text> :
          <View style={styles.textViewStyle}>
            <Text style={styles.sectionHeader}>
              {this.state.title}
            </Text>
            <MaterialIcons
                name={this.state.expanded ? 'expand-less' : 'expand-more' }
                size={24}
                style={styles.iconStyle}
                />
          </View>}
          {this.state.loading && <ActivityIndicator size="small" color={COLORS.PRIMARY_COLOR} />}
        </TouchableOpacity>
      </View>
    );
  }
}
