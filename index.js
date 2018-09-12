import React, { Component } from 'react';

import {AppRegistry, Platform} from 'react-native';
import App from './App';
import Ajuda from './Ajuda';
import Config from './Config';
import Roteiro from './Roteiro';
import TeoTreLoc from './interacao/TeoTreLoc';
import TeoTreNom from './interacao/TeoTreNom';
import PraTreNom from './interacao/PraTreNom';
import {name as appName} from './app.json';
import Toast from 'antd-mobile-rn/lib/toast';

import NfcManager, {NdefParser} from 'react-native-nfc-manager';
import Voice from 'react-native-voice';


import { createStackNavigator } from 'react-navigation';

const Nav = createStackNavigator({
    App: { screen: App },
    Ajuda: { screen: Ajuda },
    Config: { screen: Config },
    Roteiro: { screen: Roteiro },
    TeoTreLoc: { screen: TeoTreLoc },
    TeoTreNom: { screen: TeoTreNom },
    PraTreNom: { screen: PraTreNom },
},
{
  headerMode: 'none',
  navigationOptions: {
      headerVisible: false,
  }
}
);



class Root extends Component{

    constructor(props){
        super(props);

        Voice.onSpeechStart = this.onSpeechStart;
        Voice.onSpeechEnd = this.onSpeechEnd;
        Voice.onSpeechResults = this.onGetVoice;     
        
        this.state = {
            config: [],
            anatomp: null,
            modoInteracao: {
                tipoConteudo: 'pratico',
                modoAprendizagem: 'treinamento',
                sentidoIdentificacao: 'nomear',
            },
            supported: true,
            enabled: false,
            tag: {},
            gravando: false,
            voiceData: null
        }        
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
    
    componentWillUnmount() {
        Voice.destroy().then(Voice.removeAllListeners);
      }    

    render(){

        const {config, modoInteracao, anatomp, voiceData} = this.state;

        return <Nav 
            {...this.props} 
            screenProps={{
                config, 
                anatomp, 
                modoInteracao,
                voiceData,
                onChangeConfig: this.onChangeConfig,
                onSelectRoteiro: this.onSelectRoteiro,
                onChangeModoInteracao: this.onChangeModoInteracao,
                onReadNFC: this._startDetection,
                onStopNFC: this._stopDetection,
                onStartRecognizing: this._startRecognizing,
                onStopRecognizing: this._stopRecognizing,
            }} 
        />
    }


    onSpeechStart = () => {
        console.log('ini')
        this.setState({gravando: true})
    }

    onSpeechEnd = () => {
        console.log('fim')
        this.setState({gravando: false, voiceData: null})
    }

    onGetVoice = e => {
        console.log(e.value)
        this.setState({ voiceData: e.value})
    }

    async _startRecognizing(e) {
        try {
          await Voice.start('pt-BR');
        } catch (e) {
          console.error(e);
        }
      }
    
      async _stopRecognizing(e) {
        try {
          await Voice.stop();
        } catch (e) {
          console.error(e);
        }
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
