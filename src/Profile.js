import React, { Component } from 'react';
import { Alert, Button, StyleSheet, View, ListView, TextInput, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import StatusBarOffset from './StatusBarOffset'
import {getProfile, createProfile, updateProfile} from './utils/APICalls'
import {COLORS, STRINGS} from './utils/ProjectConstants'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND_COLOR,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  rowContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  editRow: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignSelf: 'stretch',
  },
  editRowRow: {
    flex: 100,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  nonEditRow: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  rowTextBoxes: {
    padding:10
  },
  rowDeleteButton: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
    padding: 5,
    color: COLORS.PRIMARY_COLOR
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding:5,
  },
  nonEditTextKey: {
    fontSize: 9,
    fontWeight: 'bold',
    paddingLeft: 20,
    paddingRight: 20,
  },
  nonEditTextValue: {
    fontSize: 14,
    paddingLeft: 20,
    paddingRight: 20,
  },
  editButton: {
    flexDirection: 'row', 
    alignSelf: 'flex-end',
    padding: 3,
  },
})

export default class Profile extends Component {
  constructor(props) {
    super(props);
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      userID: this.props.navigation.state.params.userID,
      listDataSource: [],
      dataSource: ds.cloneWithRows([]),
      profileID: '',
      savingProfile: true,
      currentlyLoading: true,
      currentlySaving: false,
      rowMaxID: 0,
    };
    this.getProfileHelper();
  }

  getProfileHelper = () =>{
    let onSuccess = (responseJson) => {
      if (responseJson === undefined) {
        this.getProfileHelper()
      }
      else if (responseJson.code === undefined || responseJson.code == 200) {
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
          let profile = []
          let i=0

          responseJson.data[0].profile.forEach(function(obj) { 
            let row = {}
            row.id = i
            row.key = obj.key
            row.value = obj.value
            row.inEdit = false
            profile.push(row)
            i++
          })

          this.setState({
            listDataSource: profile,
            rowMaxID: i,
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
        //response error
        this.setState({currentlyLoading:false})
      }
    }

    let onFailure = (error) => {
      //fatal error
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
      jsonRow.key = row.key
      jsonRow.value = row.value
      profile.profile.push(jsonRow)
      i++
    })

    if (this.state.profileID == '' || this.state.profileID === undefined) {

      let onSuccess = (responseJson) => {
        if (responseJson === undefined) {
          this.saveProfileHelper()
        }
        else if (responseJson.code === undefined || responseJson.code == 200) {
          Alert.alert(STRINGS.SAVED_PROFILE)

          //set all rows to non edit
          //Not working for some reason
          let i=0
          while (i<this.state.listDataSource.length) {
            this.state.listDataSource[i].inEdit = false
            i++
          }

          const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2})

          this.setState({
            dataSource: ds.cloneWithRows(this.state.listDataSource),
            profileID: responseJson._id,
            saveProfile: false,
            currentlySaving: false,
          })
        }
        else {
          //response error
          this.setState({
            currentlySaving: false,
          })
        }
      }

      let onFailure = (error) => {
        //fatal error
      }

      createProfile(profile, onSuccess, onFailure)
    }
    else {
      let onSuccess = (responseJson) => {
        if (responseJson === undefined) {
          this.saveProfileHelper()
        }
        else if (responseJson.code === undefined || responseJson.code == 200) {
          Alert.alert(STRINGS.SAVED_PROFILE)
          this.setState({
            currentlySaving: false,
          })
        }
        else {
          //response error
          this.setState({
            currentlySaving: false,
          })
        }
      }

      let onFailure = (error) => {
        //fatal error
      }

      updateProfile(this.state.profileID, profile, onSuccess, onFailure)
    }
  }

  addRow = () => {
    if (this.state.listDataSource.length < 50) {
      let row = {}
      row.id = this.state.rowMaxID
      row.key = ''
      row.value = ''
      row.inEdit = true
      this.state.listDataSource.push(row)
      this.setState({
        dataSource: this.state.dataSource.cloneWithRows(this.state.listDataSource),
        rowMaxID: this.state.rowMaxID + 1,
      })
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

  rowClicked = (rowData) => {
    let index = this.state.listDataSource.indexOf(rowData);
    this.state.listDataSource[index].inEdit = !this.state.listDataSource[index].inEdit
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.setState({
      dataSource: ds.cloneWithRows(this.state.listDataSource)
    })
  }

  render() {
    return (
      <View style={styles.container}>
        <StatusBarOffset />
        <ListView
          dataSource={this.state.dataSource}
          enableEmptySections={true}
          renderRow={(rowData) => 
            <View>
              <TouchableOpacity key={rowData} style={{backgroundColor: COLORS.BACKGROUND_COLOR}} onPress={this.rowClicked.bind(this, rowData)}>
                {rowData.inEdit ? 
                  <View style={styles.editRow}>
                    <View style={styles.editRowRow}>
                      <Text style={styles.rowTextBoxes}>
                        Platform: 
                      </Text>
                      <TextInput
                        autoCapitalize='none'
                        returnKeyType='go'
                        underlineColorAndroid={COLORS.PRIMARY_COLOR}
                        onChangeText={(text) => rowData.key = text}
                        maxLength={200}
                        defaultValue={rowData.key}
                        flex={99}
                      />
                    </View>
                    <View style={styles.editRowRow}>
                      <Text style={styles.rowTextBoxes}>
                        Username: 
                      </Text>
                      <TextInput
                        autoCapitalize='none'
                        returnKeyType='go'
                        underlineColorAndroid={COLORS.PRIMARY_COLOR}
                        onChangeText={(text) => rowData.value = text}
                        maxLength={200}
                        defaultValue={rowData.value}
                        flex={99}
                      />
                    </View>
                    <MaterialCommunityIcons
                      name={'delete'}
                      size={32}
                      style={styles.rowDeleteButton}
                      onIconClicked={() => this.deleteRow(rowData)}
                      onPress={() => this.deleteRow(rowData)}
                    />
                  </View> :
                  <View style={styles.nonEditRow}>
                    <Text style = {styles.nonEditTextKey}>
                      {rowData.key}
                    </Text>
                    <Text style = {styles.nonEditTextValue}>
                      {rowData.value}
                    </Text>
                  </View>
                }
                <View
                  style={{
                    borderBottomColor: COLORS.ROW_BORDER,
                    borderBottomWidth: 1,
                  }}
                />
              </TouchableOpacity>
            </View>
          }
          />
        <View style={styles.buttonRow}>
          <Button
              style={styles.globalButtons}
              onPress={this.addRow}
              title={STRINGS.ADD_ROW}
              color={COLORS.PRIMARY_COLOR}
            />
          <Button
            style={styles.globalButtons}
            onPress={this.saveProfileHelper}
            title={STRINGS.SAVE}
            color={COLORS.PRIMARY_COLOR}
          />
        </View>
      </View>
    );
  }
}