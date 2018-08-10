import React, { Component } from 'react';
import { Alert, Button, StyleSheet, View, ListView, TextInput, Text, ActivityIndicator } from 'react-native';
import StatusBarOffset from './StatusBarOffset'
import {getProfile, createProfile, updateProfile} from './utils/APICalls'
import {COLORS, STRINGS} from './utils/ProjectConstants'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND_COLOR,
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
      currentlySaving: false,
      editMode: false,
    };
    this.getProfileHelper();
  }

  getProfileHelper = () =>{
    let onSuccess = (responseJson) => {
      if (responseJson !== undefined && (responseJson.code === undefined || responseJson.code == 200)) {

        //User hasnt created a profile yet
        if (responseJson.data[0] === undefined) {
          this.setState({
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

          this.setState({
            listDataSource: profile,
          })

          this.setState({
            profileID: responseJson.data[0]._id,
            dataSource: this.state.dataSource.cloneWithRows(this.state.listDataSource),
            saveProfile: false,
            currentlyLoading: false,
          })
        }
      }
      else {
        Alert.alert(STRINGS.GET_PROFILE_FAIL, '' + JSON.stringify(responseJson))
        this.setState({currentlyLoading:false})
      }
    }

    let onFailure = (error) => {
      Alert.alert(STRINGS.NO_INTERNET)
      this.setState({currentlyLoading:false})
    }

    getProfile(this.state.userID, onSuccess, onFailure)
  }

  saveProfileHelper = () => {

    let profile = {}
    profile.profile = []

    this.setState({
      currentlySaving: true,
    })

    let i=0;

    this.state.listDataSource.forEach(function(row) {
      let jsonRow = {}
      jsonRow.row = i
      jsonRow.key = row[0]
      jsonRow.value = row[1]
      profile.profile.push(jsonRow)
      i++
    })

    if (this.state.profileID == '' || this.state.profileID === undefined) {

      let onSuccess = (responseJson) => {
        if (responseJson !== undefined && (responseJson.code === undefined || responseJson.code == 200)) {
          Alert.alert(STRINGS.SAVED_PROFILE)
          this.setState({
            profileID: responseJson._id,
            saveProfile: false,
            editMode: true,
            currentlySaving: false,
          })
        }
        else {
          Alert.alert(STRINGS.SAVE_PROFILE_FAIL, '' + JSON.stringify(responseJson))
          this.setState({
            currentlySaving: false,
          })
        }
      }

      let onFailure = (error) => {
        Alert.alert(STRINGS.NO_INTERNET)
        this.setState({
          currentlySaving: false,
        })
      }

      createProfile(profile, onSuccess, onFailure)
    }
    else {
      let onSuccess = (responseJson) => {
        if (responseJson !== undefined && (responseJson.code === undefined || responseJson.code == 200)) {
          this.setState({
            editMode: false,
            currentlySaving: false,
          })
        }
        else {
          Alert.alert(STRINGS.SAVE_PROFILE_FAIL, '' + JSON.stringify(responseJson))
          this.setState({
            currentlySaving: false,
          })
        }
      }

      let onFailure = (error) => {
        Alert.alert(STRINGS.NO_INTERNET)
        this.setState({
          currentlySaving: false,
        })
      }

      updateProfile(this.state.profileID, profile, onSuccess, onFailure)
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
      Alert.alert(STRINGS.MAX_PROFILE_REACHED)
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

  enterEditMode = () => {
    this.setState({
      editMode: true,
    })
  }

  render() {
    return (
      <View style={styles.container}>
        <StatusBarOffset />
        {this.state.editMode ? 
          <View>
            {this.state.currentlyLoading || this.state.currentlySaving ? 
              <ActivityIndicator size="large" color={COLORS.PRIMARY_COLOR} /> :
              <View style={styles.buttonRow}>
                <Button
                  style={styles.globalButtons}
                  onPress={this.saveProfileHelper}
                  title={STRINGS.SAVE}
                  color={COLORS.PRIMARY_COLOR}
                />
                <Button
                  style={styles.globalButtons}
                  onPress={this.addRow}
                  title={STRINGS.ADD_ROW}
                  color={COLORS.PRIMARY_COLOR}
                />
              </View>
            }
            <ListView
              dataSource={this.state.dataSource}
              enableEmptySections={true}
              renderRow={(rowData) => 
                <View style={styles.rowContainer}>
                  <TextInput
                    style={styles.rowTextBoxes}
                    autoCapitalize='none'
                    returnKeyType='go'
                    underlineColorAndroid={COLORS.PRIMARY_COLOR}
                    onChangeText={(text) => rowData[0] = text}
                    maxLength={200}
                    defaultValue={rowData[0]}
                  />
                  <TextInput
                    style={styles.rowTextBoxes}
                    autoCapitalize='none'
                    returnKeyType='go'
                    underlineColorAndroid={COLORS.PRIMARY_COLOR}
                    onChangeText={(text) => rowData[1] = text}
                    maxLength={200}
                    defaultValue={rowData[1]}
                  />
                  <Button
                    style={styles.rowDeleteButtons}
                    onPress={() => this.deleteRow(rowData)}
                    title={STRINGS.DELETE_ROW}
                    color={COLORS.PRIMARY_COLOR}
                  />
                </View>
              }
            />
          </View> : 
          <View>
            {this.state.currentlySearching ? 
              <ActivityIndicator size="large" color={COLORS.PRIMARY_COLOR} /> :
              <Button
                style={styles.rowDeleteButtons}
                onPress={() => this.enterEditMode()}
                title={STRINGS.EDIT_PROFILE}
                color={COLORS.PRIMARY_COLOR}
                />
            }
              <ListView
              dataSource={this.state.dataSource}
              enableEmptySections={true}
              renderRow={(rowData) => 
                <View style={styles.rowContainer}>
                  <Text>
                    {rowData[0] + ': ' + rowData[1]}
                  </Text>
                </View>
              }
              />
          </View>
        }
      </View>
    );
  }
}