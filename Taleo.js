/**
* Reads the username and password from a Google Doc and returns them as a JSON object.
*
* @return {string} the JSON object containing the username and password
*/
function retreiveCredentials_() {
  try {
    var doc = DocumentApp.openById('[INSERT-DOC-ID]');
    var docText = doc.getText();
  }
  catch (e) {
    throw "Error accessing credentials document. " + e;
    return false;
  }
  
  var username = Utilities.base64Decode(JSON.parse(docText).username);
  var password = Utilities.base64Decode(JSON.parse(docText).password);
  if (username == undefined || password == undefined) {
    throw "Error parsing credentials."
    return false;
  }
  else {
    return JSON.stringify({ 'username' : Utilities.newBlob(username).getDataAsString(), 'password' : Utilities.newBlob(password).getDataAsString() });
  }
}


/**
* Authenticates against the Taleo API and returns the authToken needed for subsequent API calls.
*
* @return {string} the authToken needed for subsequent API calls
*/
function login() {
  var credentials = retreiveCredentials_();
  var loginURL = 'https://ch.tbe.taleo.net/CH06/ats/api/v1/login?orgCode=CITIZENSCHOOLS&userName=' + JSON.parse(credentials).username + '&password=' + JSON.parse(credentials).password;
  var loginOptions = {
    'method' : 'post',
    'contentType' : 'application/json; charset=utf-8'
  };
  
  try {
    var loginResponse = UrlFetchApp.fetch(loginURL, loginOptions);
    if (loginResponse.getResponseCode() == 200) {
      Logger.log('Logged in!');
    }
    else {
      throw 'Error logging in: ' + loginResponse.getContentText();
      return false;
    }
  }
  catch (e) {
    throw 'Could not log in: ' + e;
    return false;
  }

  return authToken = 'authToken=' + JSON.parse(loginResponse).response.authToken;
}

/**
* Uses the passed in authToken to end the current session for the authenticated user.
*
* @param {string} authToken the JSON object containing the username and password
* @return {boolean} returns true if successful, false if unsuccessful
*/
function logout(authToken) { 
  var logoutURL = 'https://ch.tbe.taleo.net/CH06/ats/api/v1/logout';
  var logoutOptions = {
    'method' : 'post',
    'headers' : {
      'cookie' : authToken
    },
    'contentType' : 'application/json; charset=utf-8'
  };
  
  try {
    var logoutResponse = UrlFetchApp.fetch(logoutURL, logoutOptions);
    if (logoutResponse.getResponseCode() == 200) {
      Logger.log('Logged out!');
      return true;
    }
    else {
      throw 'Error logging out: ' + logoutResponse.getContentText();
      return false;
    }
  }
  catch (e) {
    throw 'Could not log out: ' + e;
    return false;
  }
}

/**
* Makes a Taleo API call.
*
* @param {string} authToken the JSON object containing the username and password
* @param {string} submitURL the URL used for the API call
* @param {string} method the type of API call to make (get, post, put, delete)
* @param {string} content the JSON content submitted in the API call
* @return {boolean} the results of the API submission
*/
function submit(authToken, submitURL, method, content, contentType) {
  var submitOptions;
  
  if(content && contentType) {
    submitOptions = {
      'method' : method,
      'headers' : {
        'cookie' : authToken
      },
      'contentType' : contentType,
      'payload' : content
    };
  }
  else if(content && (!(contentType))) {
    submitOptions = {
      'method' : method,
      'headers' : {
        'cookie' : authToken
      },
      'payload' : content
    };
  }
  else if((!(content)) && contentType) {
    submitOptions = {
      'method' : method,
      'headers' : {
        'cookie' : authToken
      },
      'contentType' : contentType
    };
  }
  else if((!(content)) && (!(contentType))){
    submitOptions = {
      'method' : method,
      'headers' : {
        'cookie' : authToken
      }
    };
  }

  try {
    var response = UrlFetchApp.fetch(submitURL, submitOptions);
    if (response.getResponseCode() == 200) {
      Logger.log('Data submitted!');
      return response;
    }
    else {
      throw 'Error submitting data: ' + response.getContentText();
      return false;
    }
  } 
  catch (e) {
    throw 'Could not submit data: ' + e;
    return false;
  }
}
