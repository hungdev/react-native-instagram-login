import React, {useRef, useState} from 'react'
import PropTypes from 'prop-types'
import {
    StyleSheet,
    View,
    Alert,
    Modal,
    Dimensions,
    TouchableOpacity,
    Image,
    WebView
} from 'react-native'
import qs from 'qs'

const {width, height} = Dimensions.get('window');

const patchPostMessageJsCode = `(${String(function () {
    let originalPostMessage = window.postMessage;
    let patchedPostMessage = function (message, targetOrigin, transfer) {
        originalPostMessage(message, targetOrigin, transfer)
    };
    patchedPostMessage.toString = function () {
        return String(Object.hasOwnProperty).replace('hasOwnProperty', 'postMessage')
    };
    window.postMessage = patchedPostMessage
})})();`;

export const Instagram = props => {

    const [modalVisible, setModalVisible] = useState(props.visible);
    const [key, setKey] = useState(1);
    const webView = useRef(null);

    console.log("Visible", modalVisible);

    const show = () => {
        setModalVisible(true);
    };

    const hide = () => {
        setModalVisible(false);
    };

    const _onNavigationStateChange = (webViewState) => {
        const {url} = webViewState;
        if (webViewState.title === 'Instagram' && webViewState.url === 'https://www.instagram.com/') {
            setKey(key + 1);
        }
        if (url && url.startsWith(props.redirectUrl)) {
            const match = url.match(/(#|\?)(.*)/);
            const results = qs.parse(match[2]);
            hide();
            if (results.access_token) {
                // Keeping this to keep it backwards compatible, but also returning raw results to account for future changes.
                props.onLoginSuccess(results.access_token, results)
            } else if (results.code) {
                props.onLoginSuccess(results.code, results);
            } else {
                props.onLoginFailure(results)
            }
        }
    };

    const _onMessage = (reactMessage) => {
        try {
            const json = JSON.parse(reactMessage.nativeEvent.data);
            if (json && json.error_type) {
                hide();
                props.onLoginFailure(json)
            }
        } catch (err) {
        }
    };

    // _onLoadEnd () {
    //   const scriptToPostBody = "window.postMessage(document.body.innerText, '*')"
    //     this.webView.injectJavaScript(scriptToPostBody)
    // }

    const renderClose = () => {
        const {renderClose} = props;
        if (renderClose) return renderClose();
        return (
            <Image source={require('./assets/images/close-button.png')} style={styles.imgClose} resizeMode="contain"/>
        )
    };

    const onClose = () => {
        const {onClose} = props;
        if (onClose) onClose();
        setModalVisible(false);
    };

    const renderWebview = () => {
        const {clientId, redirectUrl, scopes, responseType} = props;
        return (
            <WebView
                {...props}
                key={key}
                style={[styles.webView, props.styles.webView]}
                source={{uri: `https://api.instagram.com/oauth/authorize/?client_id=${clientId}&redirect_uri=${redirectUrl}&response_type=${responseType}&scope=${scopes.join('+')}`}}
                // scalesPageToFit
                startInLoadingState
                onNavigationStateChange={(e) => _onNavigationStateChange(e)}
                onError={(e) => _onNavigationStateChange(e)}
                // onLoadEnd={this._onLoadEnd.bind(this)}
                onMessage={(e) => _onMessage(e)}
                ref={webView}
                injectedJavaScript={patchPostMessageJsCode}
            />
        )
    };

    const {wrapperStyle, containerStyle, closeStyle} = props;

    return (
        <Modal
            animationType={'slide'}
            visible={modalVisible}
            onRequestClose={() => hide()}
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

    )

};

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
};

const defaultProps = {
    redirectUrl: 'https://google.com',
    styles: {},
    scopes: ['basic'],
    onLoginSuccess: (token) => {
        Alert.alert(
            'Alert Title',
            'Token: ' + token,
            [
                {text: 'OK'}
            ],
            {cancelable: false}
        )
    },
    onLoginFailure: (failureJson) => {
        console.debug(failureJson)
    },
    responseType: 'token',
};

Instagram.propTypes = propTypes;
Instagram.defaultProps = defaultProps;

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
});
