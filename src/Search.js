import React, { Component } from 'react';
import { Alert, AppRegistry, Button, StyleSheet, View, Image, Text, TextInput, ListView } from 'react-native';
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
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      searchText: '',
      userID: this.props.navigation.state.params.userID,
      accessToken: this.props.navigation.state.params.accessToken,
      dataSource: ds.cloneWithRows(['row 1', 'row 2']),
    };
  }

  startSearch = () =>{
    let self = this;

    fetch('http://192.168.2.25:3030/search/' + this.state.searchText + '?$limit=50', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + self.state.accessToken
      }
    })
    .then((response) => response.json())
    .then((responseJson) => {
      let friends = [];

      responseJson.users.data.forEach(function(obj) { 
        friends.push(obj.name + " - " + obj.email)
      });

      self.setState({
        dataSource: this.state.dataSource.cloneWithRows(friends)
      })
    })
    .catch((error) => {
      console.error(error);
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <TextInput
          style={{height: 40, width: 200}}
          placeholder="Search"
          autoCapitalize='none'
          returnKeyType='next'
          underlineColorAndroid={'#ffb028'}
          onChangeText={(text) => this.setState({searchText: text})}
        />
        <Button
          onPress={this.startSearch}
          title={"Search"}
          color="#ffb028"
        />
        <ListView
          dataSource={this.state.dataSource}
          renderRow={(rowData) => <Text>{rowData}</Text>}
        />
      </View>
    );
  }
}