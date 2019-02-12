
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {
  StyleSheet,
  View,
  Alert,
  Modal,
  Dimensions,
  TouchableOpacity,
  Image
} from 'react-native'
import qs from 'qs'
import { WebView } from "react-native-webview";
const { width, height } = Dimensions.get('window')

const patchPostMessageJsCode = `(${String(function () {
  var originalPostMessage = window.postMessage
  var patchedPostMessage = function (message, targetOrigin, transfer) {
    originalPostMessage(message, targetOrigin, transfer)
  }
  patchedPostMessage.toString = function () {
    return String(Object.hasOwnProperty).replace('hasOwnProperty', 'postMessage')
  }
  window.postMessage = patchedPostMessage
})})();`

export default class Instagram extends Component {
  constructor(props) {
    super(props)
    this.state = {
      modalVisible: false,
      key: 1
    }
  }

  show() {
    this.setState({ modalVisible: true })
  }

  hide() {
    this.setState({ modalVisible: false })
  }

  _onNavigationStateChange(webViewState) {
    const { url } = webViewState
    const { key } = this.state
    if (webViewState.title === 'Instagram' && webViewState.url === 'https://www.instagram.com/') {
      this.setState({ key: key + 1 })
    }
    if (url && url.startsWith(this.props.redirectUrl)) {
      const match = url.match(/(#|\?)(.*)/)
      const results = qs.parse(match[2])
      this.hide()
      if (results.access_token) {
        // Keeping this to keep it backwards compatible, but also returning raw results to account for future changes.
        this.props.onLoginSuccess(results.access_token, results)
      } else if (results.code) {
        this.props.onLoginSuccess(results.code, results);
      } else {
        this.props.onLoginFailure(results)
      }
    }
  }

  _onMessage(reactMessage) {
    try {
      const json = JSON.parse(reactMessage.nativeEvent.data)
      if (json && json.error_type) {
        this.hide()
        this.props.onLoginFailure(json)
      }
    } catch (err) { }
  }

  // _onLoadEnd () {
  //   const scriptToPostBody = "window.postMessage(document.body.innerText, '*')"
  //     this.webView.injectJavaScript(scriptToPostBody)
  // }

  renderClose() {
    const { renderClose } = this.props
    if (renderClose) return renderClose()
    return (
      <Image source={require('./assets/close-button.png')} style={styles.imgClose} resizeMode="contain" />
    )
  }

  onClose() {
    const { onClose } = this.props
    if (onClose) onClose()
    this.setState({ modalVisible: false })
  }

  renderWebview() {
    const { clientId, redirectUrl, scopes, responseType } = this.props
    const { key } = this.state
    return (
      <WebView
        {...this.props}
        key={key}
        style={[styles.webView, this.props.styles.webView]}
        source={{ uri: `https://api.instagram.com/oauth/authorize/?client_id=${clientId}&redirect_uri=${redirectUrl}&response_type=${responseType}&scope=${scopes.join('+')}` }}
        // scalesPageToFit
        startInLoadingState
        onNavigationStateChange={this._onNavigationStateChange.bind(this)}
        onError={this._onNavigationStateChange.bind(this)}
        // onLoadEnd={this._onLoadEnd.bind(this)}
        onMessage={this._onMessage.bind(this)}
        ref={(webView) => { this.webView = webView }}
        injectedJavaScript={patchPostMessageJsCode}
      />
    )
  }

  render() {
    const { wrapperStyle, containerStyle, closeStyle } = this.props
    return (
      <Modal
        animationType={'slide'}
        visible={this.state.modalVisible}
        onRequestClose={this.hide.bind(this)}
        transparent
      >
        <View style={[styles.container, containerStyle]}>
          <View style={[styles.wrapper, wrapperStyle]}>{this.renderWebview()}</View>
          <TouchableOpacity
            onPress={() => this.onClose()}
            style={[styles.close, closeStyle]}
            accessibilityComponentType={'button'}
            accessibilityTraits={['button']}
          >
            {this.renderClose()}
          </TouchableOpacity>
        </View>
      </Modal >

    )
  }
}
const propTypes = {
  clientId: PropTypes.string.isRequired,
  redirectUrl: PropTypes.string,
  scopes: PropTypes.array,
  onLoginSuccess: PropTypes.func,
  modalVisible: PropTypes.bool,
  onLoginFailure: PropTypes.func,
  responseType: PropTypes.string,
  containerStyle: PropTypes.object,
  wrapperStyle: PropTypes.object,
  closeStyle: PropTypes.object,
}

const defaultProps = {
  redirectUrl: 'https://google.com',
  styles: {},
  scopes: ['public_content'],
  onLoginSuccess: (token) => {
    Alert.alert(
      'Alert Title',
      'Token: ' + token,
      [
        { text: 'OK' }
      ],
      { cancelable: false }
    )
  },
  onLoginFailure: (failureJson) => {
    console.debug(failureJson)
  },
  responseType: 'token',
}

Instagram.propTypes = propTypes
Instagram.defaultProps = defaultProps

const styles = StyleSheet.create({
  webView: {
    flex: 1
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
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.4)',
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15
  },
  imgClose: {
    width: 30,
    height: 30,
  }
})
