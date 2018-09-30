import React, { Component } from 'react';
import { Button, StyleSheet, View, ListView, TextInput, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import TopBar from './TopBar'
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
    padding:10,
    color: COLORS.TEXT_COLOR,
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
    color: COLORS.TEXT_COLOR
  },
  nonEditTextValue: {
    fontSize: 14,
    paddingLeft: 20,
    paddingRight: 20,
    color: COLORS.TEXT_COLOR
  },
  errorText: {
    paddingLeft:10,
    color:COLORS.ERROR_RED
  },
  emptyProfileText: {
    fontSize: 14,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    color: COLORS.TEXT_COLOR
  }
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
            row.showError = false
            row.keyError = false
            row.valueError = false
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

    let i=0;

    this.state.listDataSource.forEach(function(row) {
      if (row.key !== '' && row.value !== '') {
        let jsonRow = {}
        jsonRow.row = i
        jsonRow.key = row.key
        jsonRow.value = row.value
        profile.profile.push(jsonRow)
        i++
        row.inEdit = false
        row.showError = false
        row.keyError = false
        row.valueError = false
      }
      else {
        row.inEdit = true
        row.showError = true
        if (row.key === '' & row.value === '') {
          row.keyError = true
          row.valueError = true
        } else if (row.key === '') {
          row.keyError = true
          row.valueError = false
        } else {
          row.keyError = false
          row.valueError = true
        }
      }
    })

    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2})
    this.setState({
      dataSource: ds.cloneWithRows(this.state.listDataSource),
      currentlySaving: true,
    })

    let onSuccess = (responseJson) => {
      if (responseJson === undefined) {
        this.saveProfileHelper()
      }
      else if (responseJson.code === undefined || responseJson.code == 200) {

        this.setState({
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

    if (this.state.profileID == '' || this.state.profileID === undefined) {
      createProfile(profile, onSuccess, onFailure)
    }
    else {
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
      row.showError = false
      row.keyError = false
      row.valueError = false
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
    if (!this.state.currentlyLoading && !this.state.currentlySaving) {
      let index = this.state.listDataSource.indexOf(rowData);
      this.state.listDataSource[index].inEdit = true
      const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
      this.setState({
        dataSource: ds.cloneWithRows(this.state.listDataSource)
      })
    }
  }

  saveVerification = () => {
    let errorFound = false

    this.state.listDataSource.forEach(function(row) {
      if (row.key !== '' && row.value !== '') {
        row.showError = false
        row.keyError = false
        row.valueError = false
      }
      else if (row.key === '' && row.value === '') {
        row.showError = true
        row.keyError = true
        row.valueError = true
        errorFound = true
      }
      else if (row.key === '') {
        row.showError = true
        row.keyError = true
        row.valueError = false
        errorFound = true
      }
      else {
        row.showError = true
        row.keyError = false
        row.valueError = true
        errorFound = true
      }
    })

    if (errorFound) {
      const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2})
      this.setState({
        dataSource: ds.cloneWithRows(this.state.listDataSource),
      })
    }
    else {
      this.saveProfileHelper()
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <TopBar mainText={STRINGS.PROFILE} navigation={this.props.navigation} />
        {!this.state.currentlyLoading && !this.state.currentlySaving && this.state.listDataSource.length === 0 ?
        <Text style={styles.emptyProfileText}>
          {STRINGS.EMPTY_PROFILE}
        </Text> :
        <ListView
          dataSource={this.state.dataSource}
          enableEmptySections={true}
          renderRow={(rowData) => 
            <View>
              <TouchableOpacity key={rowData} style={{backgroundColor: COLORS.BACKGROUND_COLOR}} onPress={this.rowClicked.bind(this, rowData)}>
                {rowData.inEdit ? 
                  <View style={styles.editRow}>
                    {rowData.showError && 
                      <Text style={styles.errorText}>
                        {STRINGS.BLANK_ROWS}
                      </Text>
                    }
                    <View style={styles.editRowRow}>
                      <Text style={styles.rowTextBoxes}>
                        {STRINGS.PROFILE_PLATFORM}
                      </Text>
                      <TextInput
                        autoCapitalize='none'
                        returnKeyType='go'
                        underlineColorAndroid={rowData.keyError ? COLORS.ERROR_RED : COLORS.PRIMARY_COLOR}
                        onChangeText={(text) => rowData.key = text}
                        maxLength={200}
                        defaultValue={rowData.key}
                        flex={99}
                        placeholder={STRINGS.PLATFORM_PLACEHOLDER}
                      />
                    </View>
                    <View style={styles.editRowRow}>
                      <Text style={styles.rowTextBoxes}>
                        {STRINGS.PROFILE_USERNAME}
                      </Text>
                      <TextInput
                        autoCapitalize='none'
                        returnKeyType='go'
                        underlineColorAndroid={rowData.valueError ?  COLORS.ERROR_RED : COLORS.PRIMARY_COLOR}
                        onChangeText={(text) => rowData.value = text}
                        maxLength={200}
                        defaultValue={rowData.value}
                        flex={99}
                        placeholder={STRINGS.USERNAME_PLACEHOLDER}
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
        /> }
        {this.state.currentlyLoading || this.state.currentlySaving ?
          <ActivityIndicator size="large" color={COLORS.PRIMARY_COLOR} /> :
          <View style={styles.buttonRow}>
            <Button
                style={styles.globalButtons}
                onPress={this.addRow}
                title={STRINGS.ADD_ROW}
                color={COLORS.PRIMARY_COLOR}
              />
            <Button
              style={styles.globalButtons}
              onPress={this.saveVerification}
              title={STRINGS.SAVE}
              color={COLORS.PRIMARY_COLOR}
            />
          </View>
        }
      </View>
    );
  }
}