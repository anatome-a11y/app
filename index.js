import React, { Component } from 'react';

import {AppRegistry, Platform} from 'react-native';
import App from './App';
import Ajuda from './Ajuda';
import Config from './Config';
import Roteiro from './Roteiro';
import TeoTreLoc from './interacao/TeoTreLoc';
import {name as appName} from './app.json';
import Toast from 'antd-mobile-rn/lib/toast';

import NfcManager, {NdefParser} from 'react-native-nfc-manager';


import { createStackNavigator } from 'react-navigation';

const Nav = createStackNavigator({
    App: { screen: App },
    Ajuda: { screen: Ajuda },
    Config: { screen: Config },
    Roteiro: { screen: Roteiro },
    TeoTreLoc: { screen: TeoTreLoc },
},
{
  headerMode: 'none',
  navigationOptions: {
      headerVisible: false,
  }
}
);



class Root extends Component{

    state = {
        config: [],
        anatomp: null,
        modoInteracao: {
            tipoConteudo: 'teorico',
            modoAprendizagem: 'treinamento',
            sentidoIdentificacao: 'localizar',
        },
        supported: true,
        enabled: false,
        parsedText: null,
        tag: {},
    }

    componentDidMount() {
        NfcManager.isSupported()
            .then(supported => {
                this.setState({ supported });
                if (supported) {
                    this.setState({config: ['nfc']})
                    this._startNfc();             
                }else{
                    Toast.fail('Seu dispositivo não possui suporte a NFC')
                }
            })
            .catch(e => console.log(e))
    }    

    render(){

        const {config, modoInteracao, anatomp} = this.state;

        return <Nav 
            {...this.props} 
            screenProps={{
                config, 
                anatomp, 
                modoInteracao,
                onChangeConfig: this.onChangeConfig,
                onSelectRoteiro: this.onSelectRoteiro,
                onChangeModoInteracao: this.onChangeModoInteracao,
                onReadNFC: this._startDetection,
                onStopNFC: this._stopDetection 
            }} 
        />
    }

    onChangeConfig = key => {
        const {config} = this.state;
        if(config.indexOf(key) == -1){
            this.setState({config: [...config, key]})
        }else{
            this.setState({config: config.filter(k => k != key)})
        }
    }

    onSelectRoteiro = anatomp => {
        this.setState({anatomp});
    }

    onChangeModoInteracao = (field, value) => this.setState({modoInteracao: {...this.state.modoInteracao, [field]: value}})


    _startNfc() {
        NfcManager.start({
            onSessionClosedIOS: () => {
                console.log('ios session closed');
            }
        })
            .then(result => {
                console.log('start OK', result);
            })
            .catch(error => {
                console.warn('start fail', error);
                this.setState({supported: false});
            })

        if (Platform.OS === 'android') {
            NfcManager.getLaunchTagEvent()
                .then(tag => {
                    console.log('launch tag', tag);
                    if (tag) {
                        this.setState({ tag });
                    }
                })
                .catch(err => {
                    console.log(err);
                })
            NfcManager.isEnabled()
                .then(enabled => {
                    this.setState({ enabled });
                })
                .catch(err => {
                    console.log(err);
                })
            NfcManager.onStateChanged(
                event => {
                    if (event.state === 'on') {
                        this.setState({enabled: true});
                    } else if (event.state === 'off') {
                        this.setState({enabled: false});
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
                    console.warn(err);
                })
        }
    }
    
    _startDetection = cb => {

        if(this.state.config.indexOf('nfc') != -1){
            NfcManager.registerTagEvent(tag => {cb(this._parseText(tag))})
            .then(result => {
                console.log('registerTagEvent OK', result)
            })
            .catch(error => {
                console.warn('registerTagEvent fail', error)
            })
        }
    } 
    
    _stopDetection = () => {
        NfcManager.unregisterTagEvent()
            .then(result => {
                console.log('unregisterTagEvent OK', result)
            })
            .catch(error => {
                console.warn('unregisterTagEvent fail', error)
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
