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
    if (
      webViewState.title === 'Instagram' &&
      webViewState.url === 'https://www.instagram.com/'
    ) {
      this.setState({ key: key + 1 });
    }
    if (url && url.startsWith(this.props.redirectUrl)) {
      this.webView.stopLoading();
      const match = url.match(/(#|\?)(.*)/);
      const results = qs.parse(match[2]);
      this.hide();
      if (results.access_token) {
        // Keeping this to keep it backwards compatible, but also returning raw results to account for future changes.
        this.props.onLoginSuccess(results.access_token, results);
      } else if (results.code) {
        //Fetching to get token with appId, appSecret and code
        let { code } = results;
        code = code.split('#_').join('');
        const { appId, appSecret, redirectUrl, responseType } = this.props;
        if (responseType === 'code' && !appSecret) {
          if (code) {
            this.props.onLoginSuccess(code, results);
          } else {
            this.props.onLoginFailure(results);
          }
        } else {
          let headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
          let http = axios.create({
            baseURL: 'https://api.instagram.com/oauth/access_token',
            headers: headers,
          });
          let form = new FormData();
          form.append('app_id', appId);
          form.append('app_secret', appSecret);
          form.append('grant_type', 'authorization_code');
          form.append('redirect_uri', redirectUrl);
          form.append('code', code);
          let res = await http.post('/', form).catch((error) => {
            console.log(error.response);
            return false;
          });

          if (res) {
            this.props.onLoginSuccess(res.data, results);
          } else {
            this.props.onLoginFailure(results);
          }
        }
      } else {
        this.props.onLoginFailure(results);
      }
    }
  }

  onMessage(reactMessage) {
    try {
      const json = JSON.parse(reactMessage.nativeEvent.data);
      if (json && json.error_type) {
        this.hide();
        this.props.onLoginFailure(json);
      }
    } catch (err) { }
  }

  // _onLoadEnd () {
  //   const scriptToPostBody = "window.postMessage(document.body.innerText, '*')"
  //     this.webView.injectJavaScript(scriptToPostBody)
  // }

  renderClose() {
    const { renderClose } = this.props;
    if (renderClose) {
      return renderClose();
    }
    return (
      <Image
        source={require('./assets/close-button.png')}
        style={styles.imgClose}
        resizeMode="contain"
      />
    );
  }

  onClose() {
    const { onClose } = this.props;
    if (onClose) {
      onClose();
    }
    // Reuse hide state update logic
    this.hide();
  }

  renderWebview() {
    const { appId, appSecret, redirectUrl, scopes, responseType } = this.props;
    const { key } = this.state;

    let ig_uri = `https://api.instagram.com/oauth/authorize/?app_id=${appId}&redirect_uri=${redirectUrl}&response_type=${responseType}&scope=${scopes.join(',')}`;

    return (
      <WebView
        {...this.props}
        key={key}
        style={[styles.webView, this.props.styles.webView]}
        source={{ uri: ig_uri }}
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

    // Bind onClose to onRequestClose callback rather than hide to ensure that the (optional)
    // onClose callback provided by client is called when dialog is dismissed
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
            accessibilityComponentType={'button'}
            accessibilityTraits={['button']}>
            {this.renderClose()}
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }
}
const propTypes = {
  appId: PropTypes.string.isRequired,
  appSecret: PropTypes.string,
  redirectUrl: PropTypes.string,
  scopes: PropTypes.array,
  onLoginSuccess: PropTypes.func,
  modalVisible: PropTypes.bool,
  onLoginFailure: PropTypes.func,
  responseType: PropTypes.string,
  containerStyle: PropTypes.object,
  wrapperStyle: PropTypes.object,
  closeStyle: PropTypes.object,
};

const defaultProps = {
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
  responseType: 'code'
};

Instagram.propTypes = propTypes;
Instagram.defaultProps = defaultProps;

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
