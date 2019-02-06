const baseURL = "https://62dbae42.ngrok.io/";
const usersURL = baseURL + "users";
const authenticationURL = baseURL + "authentication";
const friendsURL = baseURL + "friends";
const requestsURL = baseURL + "requests";
const profileURL = baseURL + "profile";
const searchURL = baseURL + "search";
const myFriendsURL = baseURL + "myfriends";
const myRequestsURL = baseURL + "myrequests";
const pushNotificationsURL = baseURL + "pushnotifications";

let accessToken = ''
let fcmToken = ''

const serverError = {
  "name": "Internal-Error",
  "message": "Something went wrong on the server",
  "code": 500,
  "className": "Internal-Error",
  "errors": {}
}

export function handleResponse(response, onSuccess, onFailure) {
  response.json().then(function(responseJSON) {
    if (response.status >= 200 && response.status < 400) {
      onSuccess(responseJSON);
    } else {
      onFailure(responseJSON);
    }
  }, function(error) {
    onFailure(serverError);
  })
}

export function createUser(name, username, password, onSuccess, onFailure, recurseCount) {

  recurseCount = recurseCount || 1

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
  }).then(function(response) {
    handleResponse(response, onSuccess, onFailure)
  }, function(error) {
    setTimeout(() => createUser(name, username, password, onSuccess, onFailure, recurseCount+1), 1000 * recurseCount)
  })
}

export function getAccessToken(username, password, onSuccess, onFailure, recurseCount) {
  recurseCount = recurseCount || 1
  
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
  }).then(function(response) {
    response.json().then(function(responseJSON) {
      if (responseJSON.accessToken !== undefined) {
        accessToken = responseJSON.accessToken
        onSuccess(responseJSON);
      } else {
        onFailure(responseJSON);
      }
    }, function(error) {
      onFailure(serverError);
    })
  }, function(error) {
    setTimeout(() => getAccessToken(username, password, onSuccess, onFailure, recurseCount+1), 1000 * recurseCount)
  })
}

export function getUserInfo(username, onSuccess, onFailure, recurseCount) {
  recurseCount = recurseCount || 1

  fetch(usersURL + '?email=' + username, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + accessToken
    }
  }).then(function(response) {
    handleResponse(response, onSuccess, onFailure)
  }, function(error) {
    setTimeout(() => getUserInfo(username, onSuccess, onFailure, recurseCount+1), 1000 * recurseCount)
  })
}

export function getFriends(limit, skip, onSuccess, onFailure, recurseCount) {
  recurseCount = recurseCount || 1

  fetch(myFriendsURL + '?$limit=' + limit + '&$skip=' + skip, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + accessToken
    }
  }).then(function(response) {
    handleResponse(response, onSuccess, onFailure)
  }, function(error) {
    setTimeout(() => getFriends(limit, skip, onSuccess, onFailure, recurseCount+1), 1000 * recurseCount)
  })
}

export function getRequests(limit, skip, onSuccess, onFailure, recurseCount) {
  recurseCount = recurseCount || 1

  fetch(myRequestsURL + '?$limit=' + limit + '&$skip=' + skip, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + accessToken
    }
  }).then(function(response) {
    handleResponse(response, onSuccess, onFailure)
  }, function(error) {
    setTimeout(() => getRequests(limit, skip, onSuccess, onFailure, recurseCount+1), 1000 * recurseCount)
  })
}

export function getProfile(userID, onSuccess, onFailure, recurseCount) {
  recurseCount = recurseCount || 1

  fetch(profileURL + '?userID=' + userID, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + accessToken
    }
  }).then(function(response) {
    handleResponse(response, onSuccess, onFailure)
  }, function(error) {
    setTimeout(() => getProfile(userID, onSuccess, onFailure, recurseCount+1), 1000 * recurseCount)
  })
}

export function acceptRequest(requestID, onSuccess, onFailure, recurseCount) {
  recurseCount = recurseCount || 1
  
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
  }).then(function(response) {
    handleResponse(response, onSuccess, onFailure)
  }, function(error) {
    setTimeout(() => acceptRequest(requestID, onSuccess, onFailure, recurseCount+1), 1000 * recurseCount)
  })
}

export function rejectRequest(requestID, onSuccess, onFailure, recurseCount) {
  recurseCount = recurseCount || 1

  fetch(requestsURL + '/' + requestID, {
    method: 'DELETE',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + accessToken
    },
  }).then(function(response) {
    handleResponse(response, onSuccess, onFailure)
  }, function(error) {
    setTimeout(() => rejectRequest(requestID, onSuccess, onFailure, recurseCount+1), 1000 * recurseCount)
  })
}

export function removeFriend(friendID, onSuccess, onFailure, recurseCount) {
  recurseCount = recurseCount || 1

  fetch(friendsURL + '/' + friendID, {
    method: 'DELETE',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + accessToken
    },
  }).then(function(response) {
    handleResponse(response, onSuccess, onFailure)
  }, function(error) {
    setTimeout(() => removeFriend(friendID, onSuccess, onFailure, recurseCount+1), 1000 * recurseCount)
  })
}

export function requestUser(requesteeID, onSuccess, onFailure, recurseCount) {
  recurseCount = recurseCount || 1

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
  }).then(function(response) {
    handleResponse(response, onSuccess, onFailure)
  }, function(error) {
    setTimeout(() => requestUser(requesteeID, onSuccess, onFailure, recurseCount+1), 1000 * recurseCount)
  })
}

export function search(searchText, limit, skip, onSuccess, onFailure, recurseCount) {
  recurseCount = recurseCount || 1

  fetch(searchURL + '/' + searchText + '?$limit=' + limit + '&$skip=' + skip, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + accessToken
    }
  }).then(function(response) {
    handleResponse(response, onSuccess, onFailure)
  }, function(error) {
    setTimeout(() => search(searchText, limit, skip, onSuccess, onFailure, recurseCount+1), 1000 * recurseCount)
  })
}


export function createProfile(profile, onSuccess, onFailure, recurseCount) {
  recurseCount = recurseCount || 1

  fetch(profileURL, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + accessToken
    },
    body: JSON.stringify(profile)
  }).then(function(response) {
    handleResponse(response, onSuccess, onFailure)
  }, function(error) {
    setTimeout(() => createProfile(profile, onSuccess, onFailure, recurseCount+1), 1000 * recurseCount)
  })
}

export function updateProfile(profileID, profile, onSuccess, onFailure, recurseCount) {
  recurseCount = recurseCount || 1

  fetch(profileURL + '/' + profileID, {
    method: 'PUT',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + accessToken
    },
    body: JSON.stringify(profile)
  }).then(function(response) {
    handleResponse(response, onSuccess, onFailure)
  }, function(error) {
    setTimeout(() => updateProfile(profileID, profile, onSuccess, onFailure, recurseCount+1), 1000 * recurseCount)
  })
}

export function postNotificationToken(token, os, onSuccess, onFailure, recurseCount) {
  recurseCount = recurseCount || 1
  fcmToken = token

  fetch(pushNotificationsURL, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + accessToken
    },
    body: JSON.stringify({'token': token, 'os': os})
  }).then(function(response) {
    handleResponse(response, onSuccess, onFailure)
  }, function(error) {
    setTimeout(() => postNotificationToken(token, os, onSuccess, onFailure, recurseCount+1), 1000 * recurseCount)
  })
}

export function deleteNotificationToken(onSuccess, onFailure, recurseCount) {
  recurseCount = recurseCount || 1

  fetch(pushNotificationsURL + '/' + fcmToken, {
    method: 'DELETE',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + accessToken
    }
  }).then(function(response) {
    handleResponse(response, onSuccess, onFailure)
  }, function(error) {
    setTimeout(() => deleteNotificationToken(onSuccess, onFailure, recurseCount+1), 1000 * recurseCount)
  })
}
