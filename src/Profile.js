import React, { Component } from 'react';
import { Button, StyleSheet, View, FlatList, TextInput, Text, ActivityIndicator, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
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
    fontSize: 14,
    fontWeight: 'bold',
    paddingLeft: 20,
    paddingRight: 20,
    color: COLORS.TEXT_COLOR
  },
  nonEditTextValue: {
    fontSize: 18,
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
    this.state = {
      userID: this.props.navigation.state.params.userID,
      listDataSource: [],
      profileID: '',
      savingProfile: true,
      currentlyLoading: true,
      currentlySaving: false,
      rowMaxID: 0,
      refreshList: true,
      platformIOS: Platform.OS === 'ios',
    };
    this.getProfileHelper();
  }

  getProfileHelper = () =>{
    let onSuccess = (responseJson) => {
      //User hasnt created a profile yet
      if (responseJson.data[0] === undefined) {
        this.setState({
          profileID: undefined,
          listDataSource: [],
          refreshList: !this.state.refreshList,
          saveProfile: true,
          currentlyLoading:false,
        })
      }

      //Profile already exists
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
          refreshList: !this.state.refreshList,
          rowMaxID: i,
          profileID: responseJson.data[0]._id,
          saveProfile: false,
          currentlyLoading: false,
        })
      }
    }

    let onFailure = (error) => {
      this.setState({currentlyLoading:false})
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

    this.setState({
      refreshList: !this.state.refreshList,
      currentlySaving: true,
    })

    let onSuccess = (responseJson) => {
      this.setState({
        profileID: responseJson._id,
        saveProfile: false,
        currentlySaving: false,
      })
    }

    let onFailure = (error) => {
      this.setState({
        currentlySaving: false,
      })
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
        refreshList: !this.state.refreshList,
        rowMaxID: this.state.rowMaxID + 1,
      })
    }

  }

  deleteRow = (rowData) => {
    let i=this.state.listDataSource.indexOf(rowData)
    this.state.listDataSource.splice(i,1)
    this.setState({
      refreshList: !this.state.refreshList,
    })
  }

  rowClicked = (rowData) => {
    if (!this.state.currentlyLoading && !this.state.currentlySaving) {
      let index = this.state.listDataSource.indexOf(rowData);
      this.state.listDataSource[index].inEdit = true
      this.setState({
        refreshList: !this.state.refreshList,
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
      this.setState({
        refreshList: !this.state.refreshList,
      })
    }
    else {
      this.saveProfileHelper()
    }
  }

  _keyExtractor = (item, index) => '' + item.id;

  render() {
    return (
      <KeyboardAvoidingView style={styles.container} behavior={'padding'} enabled={this.state.platformIOS}>
        <TopBar mainText={STRINGS.PROFILE} navigation={this.props.navigation} />
        {!this.state.currentlyLoading && !this.state.currentlySaving && this.state.listDataSource.length === 0 ?
        <Text style={styles.emptyProfileText}>
          {STRINGS.EMPTY_PROFILE}
        </Text> :
        <FlatList
          data={this.state.listDataSource}
          enableEmptySections={true}
          extraData={this.state.refreshList}
          keyExtractor={this._keyExtractor}
          renderItem={({item, separators}) => 
            <View>
              <TouchableOpacity key={item} style={{backgroundColor: COLORS.BACKGROUND_COLOR}} onPress={this.rowClicked.bind(this, item)}>
                {item.inEdit ? 
                  <View style={styles.editRow}>
                    {item.showError && 
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
                        underlineColorAndroid={item.keyError ? COLORS.ERROR_RED : COLORS.PRIMARY_COLOR}
                        onChangeText={(text) => item.key = text}
                        maxLength={200}
                        defaultValue={item.key}
                        flex={99}
                        placeholder={STRINGS.PLATFORM_PLACEHOLDER}
                        returnKeyType = {"go"}
                      />
                    </View>
                    <View style={styles.editRowRow}>
                      <Text style={styles.rowTextBoxes}>
                        {STRINGS.PROFILE_USERNAME}
                      </Text>
                      <TextInput
                        ref={(input) => { this.platformTextInput = input; }}
                        autoCapitalize='none'
                        underlineColorAndroid={item.valueError ?  COLORS.ERROR_RED : COLORS.PRIMARY_COLOR}
                        onChangeText={(text) => item.value = text}
                        maxLength={200}
                        defaultValue={item.value}
                        flex={99}
                        placeholder={STRINGS.USERNAME_PLACEHOLDER}
                        returnKeyType={"go"}
                      />
                    </View>
                    <MaterialCommunityIcons
                      name={'delete'}
                      size={32}
                      style={styles.rowDeleteButton}
                      onIconClicked={() => this.deleteRow(item)}
                      onPress={() => this.deleteRow(item)}
                    />
                  </View> :
                  <View style={styles.nonEditRow}>
                    <Text style = {styles.nonEditTextKey}>
                      {item.key}
                    </Text>
                    <Text style = {styles.nonEditTextValue}>
                      {item.value}
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
      </KeyboardAvoidingView>
    );
  }
}
