/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Alert,
  TouchableOpacity
} from 'react-native';
import Ins from './Instagram'
export default class InsLogin extends Component {

  render() {
    return (
      <View style={{flex:1, justifyContent: 'center', alignItems: 'center'}}>
        <TouchableOpacity style={{borderRadius: 5, backgroundColor: 'orange', height:30, width: 100, justifyContent: 'center', alignItems: 'center'}} onPress={()=> this.refs.ins.show()}>
          <Text style={{color: 'white'}}>Login</Text>
        </TouchableOpacity>
        <Ins
          ref='ins'
          clientId='c7831304b961485a938674163166e606'
          redirectUrl='https://google.com'
          scopes={['public_content+follower_list']}
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

AppRegistry.registerComponent('InsLogin', () => InsLogin);
