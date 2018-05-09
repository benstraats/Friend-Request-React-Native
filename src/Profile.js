import React, { Component } from 'react';
import { Alert, AppRegistry, Button, StyleSheet, View, Image, Text, ListView } from 'react-native';
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
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      searchText: '',
      userID: this.props.navigation.state.params.userID,
      accessToken: this.props.navigation.state.params.accessToken,
      dataSource: ds.cloneWithRows(['row 1', 'row 2']),
    };
    this.getProfile();
  }

  getProfile = () =>{
    let self = this;

    fetch('http://192.168.2.25:3030/profile?userID=' + this.state.userID, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + self.state.accessToken
      }
    })
    .then((response) => response.json())
    .then((responseJson) => {
      let profile = [];

      responseJson.data[0].profile.forEach(function(obj) { 
        profile.push("" + obj.row + ". " + obj.key + ": " + obj.value)
      });

      self.setState({
        dataSource: this.state.dataSource.cloneWithRows(profile)
      })
    })
    .catch((error) => {
      console.error(error);
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <ListView
          dataSource={this.state.dataSource}
          renderRow={(rowData) => <Text>{rowData}</Text>}
        />
      </View>
    );
  }
}