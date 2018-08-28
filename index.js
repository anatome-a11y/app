import React, { Component } from 'react';

import {AppRegistry} from 'react-native';
import App from './App';
import Ajuda from './Ajuda';
import Config from './Config';
import Roteiro from './Roteiro';
import {name as appName} from './app.json';

import { createStackNavigator } from 'react-navigation';

const Nav = createStackNavigator({
    App: { screen: App },
    Ajuda: { screen: Ajuda },
    Config: { screen: Config },
    Roteiro: { screen: Roteiro },
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
        roteiro: null
    }

    render(){

        const {config} = this.state;

        return <Nav 
            {...this.props} 
            screenProps={{
                config, 
                onChangeConfig: this.onChangeConfig,
                onSelectRoteiro: this.onSelectRoteiro,
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

}

AppRegistry.registerComponent(appName, () => Root);
