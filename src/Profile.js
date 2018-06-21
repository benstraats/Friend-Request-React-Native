import React, { Component } from 'react';
import { Alert, Button, StyleSheet, View, ListView, TextInput } from 'react-native';
import StatusBarOffset from './StatusBarOffset'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  rowContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  rowTextBoxes: {
    flex: 50,
  },
  rowDeleteButtons: {
    flex: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
      dataSource: ds.cloneWithRows([]),
      profileID: '',
      savingProfile: true,
      currentlyLoading: true,
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
      (error) => {
        Alert.alert('No Internet Connection')
        self.setState({currentlyLoading:false})
    }).then((responseJson) => {
      if (responseJson !== undefined) {
        if (responseJson.code === undefined || responseJson.code == 200) {

          //User hasnt created a profile yet
          if (responseJson.data[0] === undefined) {
            self.setState({
              profileID: undefined,
              listDataSource: [],
              dataSource: this.state.dataSource.cloneWithRows(this.state.listDataSource),
              saveProfile: true,
              currentlyLoading:false,
            })
          }

          else {
            let profile = [];

            responseJson.data[0].profile.forEach(function(obj) { 
              let row = []
              row.push(obj.key)
              row.push(obj.value)
              profile.push(row)
            })

            self.setState({
              listDataSource: profile,
            })

            self.setState({
              profileID: responseJson.data[0]._id,
              dataSource: this.state.dataSource.cloneWithRows(this.state.listDataSource),
              saveProfile: false,
              currentlyLoading: false,
            })
          }
        }
        else {
          Alert.alert('Failed to get profile', '' + JSON.stringify(responseJson))
          self.setState({currentlyLoading:false})
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

    if (self.state.profileID == '' || self.state.profileID === undefined) {
      fetch('http://192.168.2.25:3030/profile', {
        method: 'POST',
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
            self.setState({
              profileID: responseJson._id,
              saveProfile: false
            })
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
        <StatusBarOffset />
        <View style={styles.buttonRow}>
          <Button
            style={styles.globalButtons}
            onPress={this.saveProfile}
            title={"Save"}
            color="#ffb028"
          />
          <Button
            style={styles.globalButtons}
            onPress={this.addRow}
            title={"Add Row"}
            color="#ffb028"
          />
        </View>
        {
        <ListView
          dataSource={this.state.dataSource}
          enableEmptySections={true}
          renderRow={(rowData) => 
            <View style={styles.rowContainer}>
              <TextInput
                style={styles.rowTextBoxes}
                autoCapitalize='none'
                returnKeyType='go'
                underlineColorAndroid={'#ffb028'}
                onChangeText={(text) => rowData[0] = text}
                maxLength={200}
                defaultValue={rowData[0]}
              />
              <TextInput
                style={styles.rowTextBoxes}
                autoCapitalize='none'
                returnKeyType='go'
                underlineColorAndroid={'#ffb028'}
                onChangeText={(text) => rowData[1] = text}
                maxLength={200}
                defaultValue={rowData[1]}
              />
              <Button
                style={styles.rowDeleteButtons}
                onPress={() => this.deleteRow(rowData)}
                title={"Delete Row"}
                color="#ffb028"
              />
            </View>
          }
        />}
      </View>
    );
  }
}