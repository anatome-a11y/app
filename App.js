import React, { Component } from 'react';
import { StyleSheet, ScrollView, View, Text, Image } from 'react-native';

import Icon from 'antd-mobile-rn/lib/icon';
import List from 'antd-mobile-rn/lib/list';
import Toast from 'antd-mobile-rn/lib/toast';

import Container from './Container'


const ListItem = List.Item;
const Brief = ListItem.Brief;


const getMediaIcon = (media, idx) => {
  const [main, type] = media.split('/');

  let code = null;
  switch (type) {
      case 'pdf':
      case 'doc':
      case 'docx': code = '\ue6b8'; break;
      case 'xls':
      case 'xlsx': code = '\ue664'; break;
  }

  switch (main) {
      case 'application': code = '\ue65f'; break;
      case 'audio': code = '\ue677'; break;
      case 'video': code = '\ue66b'; break;
      case 'text': code = '\ue6b8'; break;
      case 'image': code = '\ue674'; break;
      default: code = '\ue63a';
  }

  return <Icon key={idx} type={code} />
}

class App extends Component {

  state = {
    anatomps: [],
    loading: true
  }

  componentDidMount() {
    Toast.loading('Aguarde...', 0)
    fetch('https://frozen-thicket-97625.herokuapp.com/anatomp', {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
    })
    .then(r => r.json())
    .then(r => {
      Toast.hide()
      if(r.status == 200){
        this.setState({anatomps: r.data})
      }else{
        throw r.error
      }
    })
    .catch(e => {
      const msg = typeof e == 'string' ? e : 'Não foi possível obter os roteiros de aprendizagem'
      Toast.hide()
      Toast.fail(msg)
    })
    .finally(() => this.setState({loading: false}))
    
  }  

  render() {
    const { anatomps } = this.state;
    const { navigation } = this.props;

    return (
      <Container navigation={navigation}>
          <List renderHeader={() => 'Roteiros de aprendizagem'}>
            {
              anatomps.map(({roteiro}) => (
                <ListItem
                onClick={this.onSelectRoteiro}
                key={roteiro._id}
                wrap
                multipleLine
                align="center"
                arrow="horizontal"
              >
                {roteiro.nome}
                <Brief>{roteiro.curso}</Brief>
                <Brief>{roteiro.disciplina}</Brief>
                <Brief>{roteiro.resumoMidias.map(getMediaIcon)}</Brief>
              </ListItem>                
              ))
            }
          </List>
      </Container>
    );
  }

  onSelectRoteiro = roteiro => {
    const { navigation, screenProps } = this.props;    
    screenProps.onSelectRoteiro(roteiro);
    navigation.navigate('Roteiro')
  }
}

const styles = StyleSheet.create({

});


export default App;