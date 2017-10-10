/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  TouchableOpacity
} from 'react-native';
import Ins from 'react-native-instagram-login'
import Cookie from 'react-native-cookie';

export default class App extends Component<{}> {
  constructor(props) {
    super(props)
    this.state = {

    }
  }

  logout() {
    Cookie.clear().then(() => {
      this.setState({ token: null })
    })
  }

  render() {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        {!this.state.token ? (
          <TouchableOpacity style={{ borderRadius: 5, backgroundColor: 'orange', height: 30, width: 100, justifyContent: 'center', alignItems: 'center' }} onPress={() => this.refs.ins.show()}>
            <Text style={{ color: 'white' }}>Login</Text>
          </TouchableOpacity>
        ) : (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ margin: 10 }}>token: {this.state.token}</Text>
              <TouchableOpacity style={{ borderRadius: 5, backgroundColor: 'green', height: 30, width: 100, justifyContent: 'center', alignItems: 'center' }} onPress={() => this.logout()}>
                <Text style={{ color: 'white' }}>Logout</Text>
              </TouchableOpacity>
            </View>
          )
        }
        <Ins
          ref='ins'
          clientId='c7831304b961485a938674163166e606'
          redirectUrl='https://google.com'
          scopes={['public_content+follower_list']}
          onLoginSuccess={(token) => this.setState({ token })}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
