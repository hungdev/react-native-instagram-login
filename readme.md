# React Native Instagram login
[![npm version](https://img.shields.io/npm/v/react-native-instagram-login.svg?style=flat)](https://www.npmjs.com/package/react-native-instagram-login)
[![npm downloads](https://img.shields.io/npm/dm/react-native-instagram-login.svg?style=flat-square)](https://www.npmjs.com/package/react-native-instagram-login)

<p align="center">
  <img src="https://github.com/hungdev/react-native-instagram-login/blob/master/ios.gif?raw=true" width=300/>
</p>

# Install

```js
npm install react-native-instagram-login --save
```

```js
react-native link react-native-webview
```

* How to get Client ID of instagram?

go to https://www.instagram.com/developer/register/ to register instagram app. then get client ID

# Usage:

```javascript
import InstagramLogin from 'react-native-instagram-login'
<View>
    <TouchableOpacity onPress={()=> this.instagramLogin.show()}>
        <Text style={{color: 'white'}}>Login</Text>
    </TouchableOpacity>
    <InstagramLogin
        ref= {ref => this.instagramLogin= ref}
        clientId='xxxxxxxxxx'
 	      redirectUrl='yourRedirectUrl'
        scopes={['public_content', 'follower_list']}
        onLoginSuccess={(token) => this.setState({ token })}
        onLoginFailure={(data) => console.log(data)}
    />
</View>

```

# Props

Property | Type | Description
------------ | ------------- | -------------
clientId | PropTypes.string | Instagram App ClientId
responseType | PropTypes.string | 'code' or 'token', default 'token'
scopes | PropTypes.array | Login Permissions
redirectUrl | PropTypes.string | Your redirectUrl
onLoginSuccess | PropTypes.func | Function will be call back on success
onLoginFailure | PropTypes.func | Function will be call back on error
onClose | PropTypes.func | Function will be call back on close modal
modalVisible | PropTypes.bool | true or false
renderClose | PropTypes.func | Render function for customize close button
containerStyle | PropTypes.object | Customize container style
wrapperStyle | PropTypes.object | Customize wrapper style
closeStyle | PropTypes.object | Customize close style


# Logout

To logout use clear cookies by using https://github.com/joeferraro/react-native-cookies

```js
import CookieManager from 'react-native-cookies';

  logout() {
    CookieManager.clearAll()
      .then((res) => {
        console.log('CookieManager.clearAll =>', res);
        this.setState({ token: '' })
      });
  }
 ```
 
 # Pull request
  Pull requests are welcome!
