
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {
  StyleSheet,
  View,
  WebView,
  Alert,
  Modal,
  Dimensions,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView
} from 'react-native'
import qs from 'qs'

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
  constructor (props) {
    super(props)
    this.state = { modalVisible: false }
  }

  show () {
    this.setState({ modalVisible: true })
  }

  hide () {
    this.setState({ modalVisible: false })
  }

  _onNavigationStateChange (webViewState) {
    const { url } = webViewState
    if (url && url.startsWith(this.props.redirectUrl)) {
      const match = url.match(/(#|\?)(.*)/)
      const results = qs.parse(match[2])
      this.hide()
      if (results.access_token) {
        // Keeping this to keep it backwards compatible, but also returning raw results to account for future changes.
        this.props.onLoginSuccess(results.access_token, results)
      } else if(results.code){
        this.props.onLoginSuccess(results.code, results);
      }else {
        this.props.onLoginFailure(results)
      }
    }
  }

  _onMessage (reactMessage) {
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

  onBackdropPress () {
    const { onBackdropPress } = this.props
    if (onBackdropPress) {
      this.setState({ modalVisible: false })
    }
  }

  render () {
    const { clientId, redirectUrl, scopes, hideCloseButton, imgCloseButton, responseType } = this.props
    return (
      <Modal
        animationType={'slide'}
        visible={this.state.modalVisible}
        onRequestClose={this.hide.bind(this)}
        transparent
      >
        <TouchableOpacity style={[styles.modalWarp, this.props.styles.modalWarp]} activeOpacity={1} onPress={() => this.onBackdropPress()}>
          <KeyboardAvoidingView behavior='padding' style={[styles.keyboardStyle, this.props.styles.keyboardStyle]}>
            <TouchableOpacity style={[styles.contentWarp, this.props.styles.contentWarp]} activeOpacity={1}>
              <WebView
                {...this.props}
                style={[styles.webView, this.props.styles.webView]}
                source={{ uri: `https://api.instagram.com/oauth/authorize/?client_id=${clientId}&redirect_uri=${redirectUrl}&response_type=${responseType}&scope=${scopes.join('+')}` }}
                scalesPageToFit
                startInLoadingState
                onNavigationStateChange={this._onNavigationStateChange.bind(this)}
                onError={this._onNavigationStateChange.bind(this)}
                // onLoadEnd={this._onLoadEnd.bind(this)}
                onMessage={this._onMessage.bind(this)}
                ref={(webView) => { this.webView = webView }}
                injectedJavaScript={patchPostMessageJsCode}
              />
              {!hideCloseButton ? (
                <TouchableOpacity onPress={this.hide.bind(this)} style={[styles.btnStyle, this.props.styles.btnStyle]}>
                  <Image source={imgCloseButton || require('./close.png')} style={[styles.closeStyle, this.props.styles.closeStyle]} />
                </TouchableOpacity>
              ) : null}
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </TouchableOpacity>

      </Modal >

    )
  }
}
const propTypes = {
  clientId: PropTypes.string.isRequired,
  redirectUrl: PropTypes.string,
  styles: PropTypes.object,
  scopes: PropTypes.array,
  onLoginSuccess: PropTypes.func,
  modalVisible: PropTypes.bool,
  onLoginFailure: PropTypes.func,
  onBackdropPress: PropTypes.bool,
  hideCloseButton: PropTypes.bool,
  responseType: PropTypes.string,
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
  modalWarp: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  keyboardStyle: {
    flex: 1,
    paddingTop: 30
  },
  contentWarp: {
    backgroundColor: '#fff',
    alignSelf: 'center',
    width: width - 30,
    height: height - 80,
    paddingTop: 30
  },
  webView: {
    flex: 1
  },
  btnStyle: {
    width: 30,
    height: 30,
    position: 'absolute',
    top: 5,
    right: 5
  },
  closeStyle: {
    width: 30, height: 30
  }
})
