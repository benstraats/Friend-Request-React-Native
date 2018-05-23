import React, { Component } from 'react';
import { Alert, AppRegistry, Button, StyleSheet, View, Image, Text, ListView, TextInput } from 'react-native';
import { createBottomTabNavigator } from 'react-navigation';

const styles = StyleSheet.create({
  container: {
   flex: 1,
   justifyContent: 'space-between',
   alignItems: 'center',
   margin: 20,
   padding: 10
  },
  rowViewContainer: {
    flex: 1, 
    flexDirection: 'row',
    fontSize: 18,
    paddingRight: 10,
    paddingTop: 10,
    paddingBottom: 10,
    alignItems: 'center',
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
      listDataSource: [],
      dataSource: ds.cloneWithRows([['',''], ['','']]),
      profileID: '',
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
    .then((response) => response.json(),
      (error) => Alert.alert('No Internet Connection'))
    .then((responseJson) => {
      if (responseJson !== undefined) {
        if (responseJson.code === undefined || responseJson.code == 200) {
          let profile = [];

          responseJson.data[0].profile.forEach(function(obj) { 
            let row = []
            row.push(obj.key)
            row.push(obj.value)
            profile.push(row)
          });

          self.setState({
            profileID: responseJson.data[0]._id
          })

          self.setState({
            listDataSource: profile
          })

          self.setState({
            dataSource: this.state.dataSource.cloneWithRows(this.state.listDataSource)
          })
        }
        else {
          Alert.alert('Failed to get profile', '' + JSON.stringify(responseJson))
        }
      }
    })
    .catch((error) => {
      console.error(error);
    });
  }

  saveProfile = () => {

    let self = this;

    let profile = {}
    profile.profile = []

    let i=0;

    this.state.listDataSource.forEach(function(row) {
      let jsonRow = {}
      jsonRow.row = i
      jsonRow.key = row[0]
      jsonRow.value = row[1]
      profile.profile.push(jsonRow)
      i++
    })

    if (self.state.profileID == '') {
      Alert.alert("first time saving")
    }
    else {
      fetch('http://192.168.2.25:3030/profile/' + self.state.profileID, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + self.state.accessToken
        },
        body: JSON.stringify(profile)
      })
      .then((response) => response.json(),
        (error) => Alert.alert('No Internet Connection'))
      .then((responseJson) => {
        if (responseJson !== undefined) {
          if (responseJson.code === undefined || responseJson.code == 200) {
            Alert.alert("saved profile")
          }
          else {
            Alert.alert('Failed to save profile', '' + JSON.stringify(responseJson))
          }
        }
      })
      .catch((error) => {
        console.error(error);
      });
    }
  }

  addRow = () => {
    if (this.state.listDataSource.length < 50) {
      this.state.listDataSource.push(['',''])
      this.setState({
        dataSource: this.state.dataSource.cloneWithRows(this.state.listDataSource)
      })
    }
    else {
      Alert.alert("Reached max profile length")
    }
  }

  deleteRow = (rowData) => {
    let i=this.state.listDataSource.indexOf(rowData)
    this.state.listDataSource.splice(i,1)
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.setState({
      dataSource: ds.cloneWithRows(this.state.listDataSource)
    })
  }

  render() {
    return (
      <View style={styles.container}>
        <Button
          onPress={this.saveProfile}
          title={"Save"}
          color="#ffb028"
        />
        <ListView
          dataSource={this.state.dataSource}
          renderRow={(rowData) => 
            <View style={styles.rowViewContainer}>
              <TextInput
                style={{height: 40, width: 100}}
                autoCapitalize='none'
                returnKeyType='go'
                underlineColorAndroid={'#ffb028'}
                onChangeText={(text) => rowData[0] = text}
                maxLength={200}
                defaultValue={rowData[0]}
              />
              <TextInput
                style={{height: 40, width: 100}}
                autoCapitalize='none'
                returnKeyType='go'
                underlineColorAndroid={'#ffb028'}
                onChangeText={(text) => rowData[1] = text}
                maxLength={200}
                defaultValue={rowData[1]}
              />
              <Button
                onPress={() => this.deleteRow(rowData)}
                title={"Delete Row"}
                color="#ffb028"
              />
            </View>
          }
        />
        <Button
          onPress={this.addRow}
          title={"Add Row"}
          color="#ffb028"
        />
      </View>
    );
  }
}