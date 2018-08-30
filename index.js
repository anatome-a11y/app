import React, { Component } from 'react';

import {AppRegistry} from 'react-native';
import App from './App';
import Ajuda from './Ajuda';
import Config from './Config';
import Roteiro from './Roteiro';
import TeoTreLoc from './interacao/TeoTreLoc';
import {name as appName} from './app.json';

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
        roteiro: null,
        modoInteracao: {
            tipoConteudo: '',
            modoAprendizagem: '',
            sentidoIdentificacao: '',
        }
    }

    render(){

        const {config, modoInteracao, roteiro} = this.state;

        return <Nav 
            {...this.props} 
            screenProps={{
                config, 
                roteiro, 
                modoInteracao,
                onChangeConfig: this.onChangeConfig,
                onSelectRoteiro: this.onSelectRoteiro,
                onChangeModoInteracao: this.onChangeModoInteracao
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

    onSelectRoteiro = roteiro => {
        this.setState({roteiro});
    }

    onChangeModoInteracao = (field, value) => this.setState({modoInteracao: {...this.state.modoInteracao, [field]: value}})

}

AppRegistry.registerComponent(appName, () => Root);
