import Toast from 'antd-mobile-rn/lib/toast';
import 'intl';
import 'intl/locale-data/jsonp/en.js';
import 'intl/locale-data/jsonp/pt-BR.js';
import React, { Component } from 'react';
import { IntlProvider } from 'react-intl';
import { AccessibilityInfo, AppRegistry, Platform, Text, Vibration } from 'react-native';
import { announceForAccessibility } from 'react-native-accessibility';
import NfcManager, { NdefParser } from 'react-native-nfc-manager';
import { createStackNavigator } from 'react-navigation';
import Ajuda from './Ajuda';
import App from './App';
import { name as appName } from './app.json';
import AppContext from './components/AppContext';
import Config from './Config';
import Info from './Info';
import PraEstLoc from './interacao/PraEstLoc';
import PraEstNom from './interacao/PraEstNom';
import PraTreLoc from './interacao/PraTreLoc';
import PraTreNom from './interacao/PraTreNom';
import TeoEstLoc from './interacao/TeoEstLoc';
import TeoEstNom from './interacao/TeoEstNom';
import TeoTreLoc from './interacao/TeoTreLoc';
import TeoTreNom from './interacao/TeoTreNom';
import { flattenMessages, messages } from './messages';
import Roteiro from './Roteiro';

// Para não exibir Warnings
console.disableYellowBox = true;

const Nav = createStackNavigator({
    App: { screen: App },
    Ajuda: { screen: Ajuda },
    Config: { screen: Config },
    Roteiro: { screen: Roteiro },
    TeoTreLoc: { screen: TeoTreLoc },
    PraTreLoc: { screen: PraTreLoc },
    TeoTreNom: { screen: TeoTreNom },
    PraTreNom: { screen: PraTreNom },
    TeoEstNom: { screen: TeoEstNom },
    PraEstNom: { screen: PraEstNom },
    TeoEstLoc: { screen: TeoEstLoc },
    PraEstLoc: { screen: PraEstLoc },
    Info: { screen: Info },
},
    {
        headerMode: 'none',
        navigationOptions: {
            headerVisible: false,
        }
    }
);

const intlMessages = flattenMessages(messages['pt-BR'])

class Root extends Component {

    constructor(props) {
        super(props);

        this.state = {
            config: ['video_imagem'],
            inputConfig: {
                chances: 3,
                tempo: 60
            },
            anatomp: null,
            modoInteracao: {
                tipoConteudo: 'pratico',
                modoAprendizagem: 'estudo',
                sentidoIdentificacao: 'localizar',
            },
            supported: true,
            // enabled: false,
            tag: {},
        }
    }



    componentDidMount() {
        const { config } = this.state;

        AccessibilityInfo.fetch().then((isEnabled) => {
            if (isEnabled) {
                this.setState({ config: [...config, 'talkback', 'voz'] })
            }
        });

        AccessibilityInfo.addEventListener('change', (isEnabled) => {
            if (isEnabled) {
                this.setState({ config: [...config, 'talkback', 'voz'] })
            } else {
                this.setState({ config: this.state.config.filter(i => i != 'talkback') })
            }
        });
        NfcManager.isSupported()
            .then(supported => {
                this.setState({ supported });
                if (supported) {
                    // this.setState({config: [...config, 'nfc']})
                    this._startNfc();
                } else {
                    const msg = 'Seu dispositivo não possui suporte a NFC';
                    Toast.fail(msg)
                    announceForAccessibility(msg)
                }
            })
            .catch(e => {
                // console.error(e)
            })
    }

    render() {

        const { config, modoInteracao, anatomp, inputConfig } = this.state;

        return <IntlProvider textComponent={Text} locale="pt-BR" defaultLocale="pt-BR" messages={intlMessages}>
            <AppContext.Provider value={{
                config,
                inputConfig,
                onReadNFC: this._startDetection,
                onStopNFC: this._stopDetection,
            }}>
                <Nav
                    {...this.props}
                    screenProps={{
                        config,
                        inputConfig,
                        anatomp,
                        modoInteracao,
                        onChangeConfig: this.onChangeConfig,
                        onChangeInputConfig: this.onChangeInputConfig,
                        onSelectRoteiro: this.onSelectRoteiro,
                        onChangeModoInteracao: this.onChangeModoInteracao,
                    }}
                />
            </AppContext.Provider>
        </IntlProvider>
    }


    onChangeConfig = key => {
        const { config } = this.state;
        if (config.indexOf(key) == -1) {
            this.setState({ config: [...config, key] })
        } else {
            this.setState({ config: config.filter(k => k != key) })
        }
    }

    onChangeInputConfig = field => value => this.setState({ ...this.state, inputConfig: { ...this.state.inputConfig, [field]: value } })

    onSelectRoteiro = anatomp => {
        this.setState({ anatomp });
    }

    onChangeModoInteracao = (field, value) => this.setState({ modoInteracao: { ...this.state.modoInteracao, [field]: value } })


    _startNfc() {
        NfcManager.start({
            onSessionClosedIOS: () => {
                // console.log('ios session closed');
            }
        })
            .then(result => {
                // console.log('start OK', result);
            })
            .catch(error => {
                // console.warn('start fail', error);
                this.setState({ supported: false });
            })

        if (Platform.OS === 'android') {
            NfcManager.getLaunchTagEvent()
                .then(tag => {
                    // console.log('launch tag', tag);
                    if (tag) {
                        this.setState({ tag });
                    }
                })
                .catch(err => {
                    // console.log(err);
                })
            NfcManager.isEnabled()
                .then(enabled => {
                    //this.setState({ enabled });
                })
                .catch(err => {
                    // console.log(err);
                })
            NfcManager.onStateChanged(
                event => {
                    if (event.state === 'on') {
                        // this.setState({ enabled: true });
                    } else if (event.state === 'off') {
                        // this.setState({ enabled: false });
                    } else if (event.state === 'turning_on') {
                        // do whatever you want
                    } else if (event.state === 'turning_off') {
                        // do whatever you want
                    }
                }
            )
                .then(sub => {
                    this._stateChangedSubscription = sub;
                    // remember to call this._stateChangedSubscription.remove()
                    // when you don't want to listen to this anymore
                })
                .catch(err => {
                    // console.warn(err);
                })
        }
    }

    _startDetection = cb => e => {

        if (this.state.config.indexOf('nfc') != -1) {
            Vibration.vibrate(300)
            NfcManager.registerTagEvent(tag => { Vibration.vibrate(300); cb(this._parseText(tag)) })
                .then(result => {
                    // console.log('registerTagEvent OK', result)
                })
                .catch(error => {
                    // console.warn('registerTagEvent fail', error)
                })
        }
    }

    _stopDetection = () => {
        NfcManager.unregisterTagEvent()
            .then(result => {
                // console.log('unregisterTagEvent OK', result)
            })
            .catch(error => {
                // console.warn('unregisterTagEvent fail', error)
            })
    }


    _parseText = (tag) => {
        if (tag.ndefMessage) {
            return NdefParser.parseText(tag.ndefMessage[0]);
        }
        return null;
    }
}

AppRegistry.registerComponent(appName, () => Root);
