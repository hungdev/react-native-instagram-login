# React Native Instagram login
[![npm version](https://img.shields.io/npm/v/react-native-instagram-login.svg?style=flat)](https://www.npmjs.com/package/react-native-instagram-login)
[![npm downloads](https://img.shields.io/npm/dm/react-native-instagram-login.svg?style=flat-square)](https://www.npmjs.com/package/react-native-instagram-login)

<p align="center">
  <img src="https://github.com/hungdev/react-native-instagram-login/blob/master/instagram.gif?raw=true" width=200/>
</p>

# Install

```js
npm install react-native-instagram-login --save
```

* How to get Client ID of instagram?

go to https://www.instagram.com/developer/register/ to register instagram app. then get client ID

# Usage:

```javascript
import InstagramLogin from 'react-native-instagram-login'
<View>
    <TouchableOpacity onPress={()=> this.refs.instagramLogin.show()}>
        <Text style={{color: 'white'}}>Login</Text>
    </TouchableOpacity>
    <InstagramLogin
        ref='instagramLogin'
        clientId='xxxxxxxxxx'
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
scopes | PropTypes.array | Array
redirectUrl | PropTypes.string | String
styles | PropTypes.object | Object
onLoginSuccess | PropTypes.func | Function callback
onLoginFailure | PropTypes.func | Function callback
modalVisible | PropTypes.bool | true or false
onBackdropPress | PropTypes.bool | true or false
hideCloseButton | PropTypes.bool | true or false
imgCloseButton | | source image close button (look at example)


## Styles

To override default styles, set a custom `styles` prop.

Property | Description
------------ | -------------
modalWarp | container style full screen
keyboardStyle | KeyboardAvoidingView style
contentWarp | content style
webView | webView
btnStyle | warp close button style
closeStyle | image style close button


```javascript
<InstagramLogin styles={styles} />

const styles = StyleSheet.create({
  closeStyle: {
    marginTop: 22,
  }
});
```


# Logout

To logout use clear cookies by using https://github.com/shimohq/react-native-cookie

```js
import Cookie from 'react-native-cookie'

  logout() {
    Cookie.clear().then(() => {
      this.setState({ token: null })
    })
  }
 ```
