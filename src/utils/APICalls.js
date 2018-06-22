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

export function createUser(name, username, password, onSuccess, onFailure) {
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
    (error) => onFailure(error))
  .then((responseJson) => onSuccess(responseJson))
  .catch((error) => {
    console.error(error);
  });
}

export function getAccessToken(username, password, onSuccess, onFailure) {
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
    (error) => onFailure(error))
  .then((responseJson) => {
      if (responseJson !== undefined && (responseJson.code === undefined || responseJson.code == 200)) {
          accessToken = responseJson.accessToken
      }
      onSuccess(responseJson)
  })
  .catch((error) => {
    console.error(error);
  });
}

export function getUserInfo(username, onSuccess, onFailure) {
  fetch(usersURL + '?email=' + username, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + accessToken
    }
  })
  .then((response) => response.json(),
    (error) => onFailure(error))
  .then((responseJson) => onSuccess(responseJson))
  .catch((error) => {
    console.error(error);
  });
}

export function getFriends(limit, skip, onSuccess, onFailure) {
  fetch(myFriendsURL + '?$limit=' + limit + '&$skip=' + skip, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + accessToken
    }
  })
  .then((response) => response.json(),
    (error) => onFailure(error))
  .then((responseJson) => onSuccess(responseJson))
  .catch((error) => {
    console.error(error);
  });
}

export function getRequests(limit, skip, onSuccess, onFailure) {
  fetch(myRequestsURL + '?$limit=' + limit + '&$skip=' + skip, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + accessToken
    }
  })
  .then((response) => response.json(),
    (error) => onFailure(error))
  .then((responseJson) => onSuccess(responseJson))
  .catch((error) => {
    console.error(error);
  });
}

export function getProfile(userID, onSuccess, onFailure) {
  fetch(profileURL + '?userID=' + userID, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + accessToken
    }
  })
  .then((response) => response.json(),
    (error) => onFailure(error))
  .then((responseJson) => onSuccess(responseJson))
  .catch((error) => {
    console.error(error);
  });
}

export function acceptRequest(requestID, onSuccess, onFailure) {
  fetch(friendsURL, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + accessToken
    },
    body: JSON.stringify({
      "requestID": requestID
    })
  })
  .then((response) => response.json(),
    (error) => onFailure(error))
  .then((responseJson) => onSuccess(responseJson))
  .catch((error) => {
    console.error(error);
  });
}

export function rejectRequest(requestID, onSuccess, onFailure) {
  fetch(requestsURL + '/' + requestID, {
    method: 'DELETE',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + accessToken
    },
  })
  .then((response) => response.json(),
    (error) => onFailure(error))
  .then((responseJson) => onSuccess(responseJson))
  .catch((error) => {
    console.error(error);
  });
}

export function removeFriend(friendID, onSuccess, onFailure) {
  fetch(friendsURL + '/' + friendID, {
    method: 'DELETE',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + accessToken
    },
  })
  .then((response) => response.json(),
    (error) => onFailure(error))
  .then((responseJson) => onSuccess(responseJson))
  .catch((error) => {
    console.error(error);
  });
}

export function requestUser(requesteeID, onSuccess, onFailure) {

  fetch(requestsURL, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + accessToken
    },
    body: JSON.stringify({
      "requesteeID": requesteeID
    })
  })
  .then((response) => response.json(),
    (error) => onFailure(error))
  .then((responseJson) => onSuccess(responseJson))
  .catch((error) => {
    console.error(error);
  });
}

export function search(searchText, limit, skip, onSuccess, onFailure) {
  fetch(searchURL + '/' + searchText + '?$limit=' + limit + '&$skip=' + skip, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + accessToken
    }
  })
  .then((response) => response.json(),
    (error) => onFailure(error))
  .then((responseJson) => onSuccess(responseJson))
  .catch((error) => {
    console.error(error);
  });
}
