# React Native Instagram login
[![npm version](https://img.shields.io/npm/v/react-native-instagram-login.svg?style=flat)](https://www.npmjs.com/package/react-native-instagram-login)
[![npm downloads](https://img.shields.io/npm/dm/react-native-instagram-login.svg?style=flat-square)](https://www.npmjs.com/package/react-native-instagram-login)

<p align="center">
  <img src="https://github.com/hungdev/react-native-instagram-login/blob/master/ios.gif?raw=true" width=300/>
</p>


### IMPORTANT NOTES:
`react-native-instagram-login` version 2 switches to the Instagram Graph API.

If you want to use old version 1, [please read docs](https://github.com/hungdev/react-native-instagram-login/tree/v1)

## Install

```js
npm install react-native-instagram-login react-native-webview --save
```

After that run:

```js
react-native link react-native-webview
```

for ios:

```js
cd ios
```

```js
pod install
```

* How to get `appId`, `appSecret` of instagram?

> [Simple setup](https://developers.facebook.com/docs/instagram-basic-display-api/getting-started), you only need to complete step 3.

> Then go to Instagram> Basic Display> Instagram App ID field

<p align="center">
  <img src="./assets/img-appid.png" width='100%'/>
</p>

This is going to give you an access_token, which one can be used on the new Graph Api, go to https://developers.facebook.com/docs/instagram-basic-display-api/guides/getting-profiles-and-media for docs. 


## Usage:


```javascript

import InstagramLogin from 'react-native-instagram-login'
import store from 'react-native-simple-store'
<View>
    <TouchableOpacity onPress={()=> this.instagramLogin.show()}>
        <Text style={{color: 'white'}}>Login</Text>
    </TouchableOpacity>
    <InstagramLogin
        ref={ref => (this.instagramLogin = ref)}
        appId='your-app-id'
        appSecret='your-app-secret'
        redirectUrl='your-redirect-Url'
        scopes={['user_profile', 'user_media']}
        onLoginSuccess={ this.setIgToken }
        onLoginFailure={(data) => console.log(data)}
    />
</View>

setIgToken = async (data) => {
    await store.save('igToken', data.access_token)
    await store.save('igUserId', data.user_id)
    this.setState({ igToken: data.access_token, igUserId: data.user_id})
}
```


## Props

| Property       | Type             | Description                                |
| -------------- | ---------------- | ------------------------------------------ |
| appId          | PropTypes.string | Instagram App_id                           |
| appSecret      | PropTypes.string | Instagram App_secret                       |
| responseType   | PropTypes.string | 'code' or 'token', default 'token'         |
| scopes         | PropTypes.array  | Login Permissions                          |
| redirectUrl    | PropTypes.string | Your redirectUrl                           |
| onLoginSuccess | PropTypes.func   | Function will be call back on success      |
| onLoginFailure | PropTypes.func   | Function will be call back on error        |
| onClose        | PropTypes.func   | Function will be call back on close modal  |
| modalVisible   | PropTypes.bool   | true or false                              |
| renderClose    | PropTypes.func   | Render function for customize close button |
| containerStyle | PropTypes.object | Customize container style                  |
| wrapperStyle   | PropTypes.object | Customize wrapper style                    |
| closeStyle     | PropTypes.object | Customize close style                      |


## Logout

Currently the react-native-cookies library is not working, so we cannot delete cookies, so temporary the solution is to disable cookies on webview.
[See more](https://github.com/hungdev/react-native-instagram-login/issues/37#issuecomment-504268747)

~To logout use clear cookies by using https://github.com/joeferraro/react-native-cookies~

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
  ## Contributing
  Special thanks [@AlbertoIHP](https://github.com/AlbertoIHP) for v2.

  This project exists thanks to all the people who contribute. [[Contribute]]([CONTRIBUTING.md](https://github.com/hungdev/react-native-instagram-login/graphs/contributors)).
 ## Pull request
  Pull requests are welcome!
