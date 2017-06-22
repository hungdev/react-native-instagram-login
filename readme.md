# React Native Instagram login
<p align="center">
  <img src="https://github.com/hungdev/react-native-instagram-login/blob/master/instagram.gif?raw=true" width=200/>
</p>

# Install

```js
Run npm install react-native-instagram-login --save
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
    />
</View>

```

# Props

Property | Type | Description
------------ | ------------- | -------------
clientId | PropTypes.string | Instagram App ClientId
scopes | PropTypes.array | Array
redirectUrl | PropTypes.string | String
styles | PropTypes.object | Object
onLoginSuccess | PropTypes.func | Function callback
modalVisible | PropTypes.bool | true or false

* Logout

To logout use clear cookies by using https://github.com/shimohq/react-native-cookie

```js
import Cookie from 'react-native-cookie'

  logout() {
    Cookie.clear().then(() => {
      this.setState({ token: null })
    })
  }
 ```
