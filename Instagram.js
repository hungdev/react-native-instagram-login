import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet, View, Alert, Modal, Dimensions, TouchableOpacity, Image,
} from 'react-native';
import qs from 'qs';
import axios from 'axios';
import { WebView } from 'react-native-webview';

const { width, height } = Dimensions.get('window');

const patchPostMessageJsCode = `(${String(function () {
  var originalPostMessage = window.postMessage;
  var patchedPostMessage = function (message, targetOrigin, transfer) {
    originalPostMessage(message, targetOrigin, transfer);
  };
  patchedPostMessage.toString = function () {
    return String(Object.hasOwnProperty).replace(
      'hasOwnProperty',
      'postMessage',
    );
  };
  window.postMessage = patchedPostMessage;
})})();`;

export default class Instagram extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      key: 1,
    };
  }

  show() {
    this.setState({ modalVisible: true });
  }

  hide() {
    this.setState({ modalVisible: false });
  }

  async onNavigationStateChange(webViewState) {
    const { url } = webViewState;
    const { key } = this.state;

    // Increment key to reload WebView when on the Instagram homepage
    if (webViewState.title === 'Instagram' && webViewState.url === 'https://www.instagram.com/') {
      this.setState({ key: key + 1 });
    }

    // Check if URL matches redirect URL
    if (url && url.startsWith(this.props.redirectUrl)) {
      this.webView.stopLoading();
      const match = url.match(/(#|\?)(.*)/);
      const results = qs.parse(match ? match[2] : '');
      this.hide();

      if (results.access_token) {
        this.props.onLoginSuccess(results.access_token, results);
      } else if (results.code) {
        await this.handleCodeResponse(results.code);
      } else {
        this.props.onLoginFailure(results);
      }
    }
  }

  async handleCodeResponse(code) {
    const { appId, appSecret, redirectUrl, responseType } = this.props;

    // Clean up the code string
    const cleanedCode = code.split('#_').join('');

    if (responseType === 'code' && !appSecret) {
        if (cleanedCode) {
            this.props.onLoginSuccess(cleanedCode);
        } else {
            this.props.onLoginFailure({});
        }
    } else {
        // Make a request to get the access token
        try {
            const res = await axios.post('https://api.instagram.com/oauth/access_token', 
            new URLSearchParams({
                client_id: appId,
                client_secret: appSecret,
                grant_type: 'authorization_code',
                redirect_uri: redirectUrl,
                code: cleanedCode,
            }), 
            {
                withCredentials: false, // Disable cookie handling
            });

            this.props.onLoginSuccess(res.data);
        } catch (error) {
            console.error(error.response || error.message);
            this.props.onLoginFailure({});
        }
    }
}

  onMessage(reactMessage) {
    try {
      const json = JSON.parse(reactMessage.nativeEvent.data);
      if (json?.error_type) {
        this.hide();
        this.props.onLoginFailure(json);
      }
    } catch (err) {
      console.error('Error parsing message:', err);
    }
  }

  renderClose() {
    const { renderClose } = this.props;
    return renderClose ? renderClose() : (
      <Image
        source={require('./assets/close-button.png')}
        style={styles.imgClose}
        resizeMode="contain"
      />
    );
  }

  onClose() {
    this.props.onClose?.();
    this.hide();
  }

  renderWebview() {
    const { appId, redirectUrl, scopes, responseType, language = 'en', incognito = false } = this.props;
    const { key } = this.state;

    const ig_uri = `https://api.instagram.com/oauth/authorize/?client_id=${appId}&redirect_uri=${redirectUrl}&response_type=${responseType}&scope=${scopes.join(',')}`;

    return (
      <WebView
        {...this.props}
        key={key}
        incognito={incognito}
        style={[styles.webView, this.props.styles?.webView]}
        source={{ uri: ig_uri, headers: { "Accept-Language": language } }}
        startInLoadingState
        onNavigationStateChange={this.onNavigationStateChange.bind(this)}
        onError={this.onNavigationStateChange.bind(this)}
        onMessage={this.onMessage.bind(this)}
        ref={(webView) => { this.webView = webView; }}
        injectedJavaScript={patchPostMessageJsCode}
      />
    );
  }

  render() {
    const { wrapperStyle, containerStyle, closeStyle } = this.props;

    return (
      <Modal
        animationType={'slide'}
        visible={this.state.modalVisible}
        onRequestClose={this.onClose.bind(this)}
        transparent>
        <View style={[styles.container, containerStyle]}>
          <View style={[styles.wrapper, wrapperStyle]}>
            {this.renderWebview()}
          </View>
          <TouchableOpacity
            onPress={() => this.onClose()}
            style={[styles.close, closeStyle]}
            accessibilityRole={'button'}>
            {this.renderClose()}
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }
}

Instagram.propTypes = {
  appId: PropTypes.string.isRequired,
  appSecret: PropTypes.string,
  redirectUrl: PropTypes.string,
  scopes: PropTypes.array,
  onLoginSuccess: PropTypes.func,
  onLoginFailure: PropTypes.func,
  modalVisible: PropTypes.bool,
  responseType: PropTypes.string,
  containerStyle: PropTypes.object,
  wrapperStyle: PropTypes.object,
  closeStyle: PropTypes.object,
  renderClose: PropTypes.func,
  styles: PropTypes.object,
};

Instagram.defaultProps = {
  redirectUrl: 'https://google.com',
  styles: {},
  scopes: ['user_profile', 'user_media'],
  onLoginSuccess: (token) => {
    Alert.alert('Alert Title', 'Token: ' + token, [{ text: 'OK' }], {
      cancelable: false,
    });
  },
  onLoginFailure: (failureJson) => {
    console.debug(failureJson);
  },
  responseType: 'code',
};

const styles = StyleSheet.create({
  webView: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingVertical: 40,
    paddingHorizontal: 10,
  },
  wrapper: {
    flex: 1,
    borderRadius: 5,
    borderWidth: 5,
    borderColor: 'rgba(0, 0, 0, 0.6)',
  },
  close: {
    position: 'absolute',
    top: 35,
    right: 5,
    backgroundColor: '#000',
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.4)',
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
  },
  imgClose: {
    width: 30,
    height: 30,
  },
});
