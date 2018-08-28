import React, { Component } from 'react';
import { StyleSheet, ScrollView, View, Text, Image } from 'react-native';

import Icon from 'antd-mobile-rn/lib/icon';
import List from 'antd-mobile-rn/lib/list';

import Container from './Container'


const ListItem = List.Item;
const Brief = ListItem.Brief;


const _roteiro = [
  {
    id: 1,
    nome: 'Este é o roteiro 1',
    curso: 'Engenharia de computação',
    disciplina: 'Engenharia de Software',
    midias: [
      {type: 'video/mp4'},    
    ]
  },
  {
    id: 2,
    nome: 'Meu roteiro 2 especial',
    curso: 'Massoterapia',
    disciplina: 'Anatomia 1',
    midias: [
      {type: 'audio/mp3'},
      {type: 'application/pdf'},
    ]
  },
  {
    id: 3,
    nome: 'Roteiro prático 5',
    curso: 'Engenharia de software',
    disciplina: 'IHC',
    midias: []
  },
]

const getMediaIcon = (media, idx) => {
  const [main, type] = media.type.split('/');

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
    roteiros: _roteiro
  }

  render() {
    const { roteiros } = this.state;
    const { navigation } = this.props;

    return (
      <Container navigation={navigation}>
          <List renderHeader={() => 'Roteiros de aprendizagem'}>
            {
              roteiros.map(rot => (
                <ListItem
                onClick={this.onSelectRoteiro}
                key={rot.id}
                wrap
                multipleLine
                align="center"
                arrow="horizontal"
              >
                {rot.nome}
                <Brief>{rot.curso}</Brief>
                <Brief>{rot.disciplina}</Brief>
                <Brief>{rot.midias.map(getMediaIcon)}</Brief>
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