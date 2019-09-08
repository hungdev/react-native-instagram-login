import React, { Component } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import InstagramLogin from './Instagram';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      token: ''
    };
  }

  render() {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <TouchableOpacity
          style={{
            borderRadius: 5,
            backgroundColor: 'orange',
            height: 30, width: 100,
            justifyContent: 'center',
            alignItems: 'center'
          }}
          onPress={() => this.instagramLogin.show()}>
          <Text style={{ color: 'white', textAlign: 'center' }}>Login now</Text>
        </TouchableOpacity>
        <Text style={{ margin: 10 }}>Token: {this.state.token}</Text>
        {this.state.failure && <View>
          <Text style={{ margin: 10 }}>failure: {JSON.stringify(this.state.failure)}</Text>
        </View>}
        <InstagramLogin
          ref={ref => (this.instagramLogin = ref)}
          clientId="931cca1d0c154de3aafd83300ff8b288"
          redirectUrl="https://google.com"
          scopes={['basic']}
          onLoginSuccess={token => this.setState({ token })}
          onLoginFailure={data => this.setState({ failure: data })}
        />
      </View>
    );
  }
}

export default App;
