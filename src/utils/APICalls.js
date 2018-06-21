const baseURL = 'http://192.168.2.25:3030/'//"http://api.friendrequest.ca/";
const usersURL = baseURL + "users";
const authenticationURL = baseURL + "authentication";
const friendsURL = baseURL + "friends";
const requestsURL = baseURL + "requests";
const profileURL = baseURL + "profile";
const searchURL = baseURL + "search";
const myFriendsURL = baseURL + "myfriends";
const myRequestsURL = baseURL + "myrequests";

let accessToken = ''

export function createUser(name, username, password, callbackSuccess, callbackError) {
    fetch(usersURL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "name": name,
        "email": username,
        "password": password
      })
    })
    .then((response) => response.json(),
      (error) => callbackError(error))
    .then((responseJson) => callbackSuccess(responseJson))
    .catch((error) => {
      console.error(error);
    });
  }

  export function getAccessToken(username, password, callbackSuccess, callbackError) {
    fetch(authenticationURL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "strategy": "local",
        "email": username,
        "password": password
      })
    })
    .then((response) => response.json(),
      (error) => callbackError(error))
    .then((responseJson) => {
        if (responseJson !== undefined && (responseJson.code === undefined || responseJson.code == 200)) {
            accessToken = responseJson.accessToken
        }
        callbackSuccess(responseJson)
    })
    .catch((error) => {
      console.error(error);
    });
  }

  export function getUserInfo(username, callbackSuccess, callbackError) {
    fetch(usersURL + '?email=' + username, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + accessToken
      }
    })
    .then((response) => response.json(),
      (error) => callbackError(error))
    .then((responseJson) => callbackSuccess(responseJson))
    .catch((error) => {
      console.error(error);
    });
  }