
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
      const match = url.match(/#(.*)/)
      if (match && match[1]) {
        const params = qs.parse(match[1])
        if (params.access_token) {
          this.hide()
          this.props.onLoginSuccess(params.access_token)
        }
      } else {
        this.hide()
      }
    }
  }

  render () {
    const { clientId, redirectUrl, scopes } = this.props
    return (
      <Modal
        animationType={'slide'}
        visible={this.state.modalVisible}
        onRequestClose={this.hide.bind(this)}
        transparent
      >
        <View style={styles.modalWarp}>
          <KeyboardAvoidingView behavior='padding' style={styles.keyboardStyle}>
            <View style={styles.contentWarp}>
              <WebView
                style={[{ flex: 1 }, this.props.styles]}
                source={{ uri: `https://api.instagram.com/oauth/authorize/?client_id=${clientId}&redirect_uri=${redirectUrl}&response_type=token&scope=${scopes.join('+')}` }}
                scalesPageToFit
                startInLoadingState
                onNavigationStateChange={this._onNavigationStateChange.bind(this)}
                onError={this._onNavigationStateChange.bind(this)}
              />
              <TouchableOpacity onPress={this.hide.bind(this)} style={styles.btnStyle}>
                <Image source={require('./close.png')} style={styles.closeStyle} />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>

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
  modalVisible: PropTypes.bool
}

const defaultProps = {
  redirectUrl: 'https://google.com',
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
  }
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
    height: height - 80
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
