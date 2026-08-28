import React, { useState, useRef } from 'react';
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

export default function Instagram(props) {
  const { wrapperStyle, containerStyle, closeStyle, onLoginSuccess, onLoginFailure, redirectUrl, appId, appSecret, responseType, scopes, language = 'en', incognito = false } = props;
  const [modalVisible, setModalVisible] = useState(false);
  const [key, setKey] = useState(1);
  const webViewRef = useRef(null);

  function show() {
    setModalVisible(true);
  }

  function hide() {
    setModalVisible(false);
  }

  async function onNavigationStateChange(webViewState) {
    const { url } = webViewState;

    if (
      webViewState.title === 'Instagram' &&
      webViewState.url === 'https://www.instagram.com/'
    ) {
      setKey((k) => k + 1);
    }
    if (url && url.startsWith(redirectUrl)) {
      webViewRef.current.stopLoading();
      const match = url.match(/(#|\?)(.*)/);
      const results = qs.parse(match[2]);
      hide();
      if (results.access_token) {
        // Keeping this to keep it backwards compatible, but also returning raw results to account for future changes.
        onLoginSuccess(results.access_token, results);
      } else if (results.code) {
        //Fetching to get token with appId, appSecret and code
        let { code } = results;
        code = code.split('#_').join('');
        if (responseType === 'code' && !appSecret) {
          if (code) {
            onLoginSuccess(code, results);
          } else {
            onLoginFailure(results);
          }
        } else {
          let headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
          let http = axios.create({
            baseURL: 'https://api.instagram.com/oauth/access_token',
            headers: headers,
            withCredentials: false,
          });
          let form = new FormData();
          form.append('client_id', appId);
          form.append('client_secret', appSecret);
          form.append('grant_type', 'authorization_code');
          form.append('redirect_uri', redirectUrl);
          form.append('code', code);
          let res = await http.post('/', form).catch((error) => {
            console.log(error.response);
            return false;
          });

          if (res) {
            onLoginSuccess(res.data, results);
          } else {
            onLoginFailure(results);
          }
        }
      } else {
        onLoginFailure(results);
      }
    }
  }

  function onMessage(reactMessage) {
    try {
      const json = JSON.parse(reactMessage.nativeEvent.data);
      if (json && json.error_type) {
        hide();
        onLoginFailure(json);
      }
    } catch (err) {}
  }

  function renderClose() {
    if (props.renderClose) {
      return props.renderClose();
    }
    return (
      <Image
        source={require('./assets/close-button.png')}
        style={styles.imgClose}
        resizeMode='contain'
      />
    );
  }

  function onClose() {
    if (props.onClose) {
      props.onClose();
    }
    // Reuse hide state update logic
    hide();
  }

  function renderWebview() {
    let ig_uri = `https://api.instagram.com/oauth/authorize/?client_id=${appId}&redirect_uri=${redirectUrl}&response_type=${responseType}&scope=${scopes.join(',')}`;

    return (
      <WebView
        {...props}
        key={key}
        incognito={incognito}
        style={[styles.webView, props.styles.webView]}
        source={{
          uri: ig_uri,
          headers: {
            'Accept-Language': `${language}`,
          },
        }}
        startInLoadingState
        onNavigationStateChange={onNavigationStateChange}
        onError={onNavigationStateChange}
        onMessage={onMessage}
        ref={(webView) => {
          webViewRef.current = webView;
        }}
        injectedJavaScript={patchPostMessageJsCode}
      />
    );
  }

  return (
    <Modal
      animationType={'slide'}
      visible={modalVisible}
      onRequestClose={onClose}
      transparent
    >
      <View style={[styles.container, containerStyle]}>
        <View style={[styles.wrapper, wrapperStyle]}>{renderWebview()}</View>
        <TouchableOpacity
          onPress={() => onClose()}
          style={[styles.close, closeStyle]}
          accessibilityComponentType={'button'}
          accessibilityTraits={['button']}
        >
          {renderClose()}
        </TouchableOpacity>
      </View>
    </Modal>
  );
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
