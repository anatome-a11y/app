import React, { Component, Fragment } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import Icon from 'antd-mobile-rn/lib/icon';
import List from 'antd-mobile-rn/lib/list';
import Flex from 'antd-mobile-rn/lib/flex';
import Toast from 'antd-mobile-rn/lib/toast';
import Tag from 'antd-mobile-rn/lib/tag';

import { announceForAccessibility, focusOnView } from 'react-native-accessibility';

import Container from './Container'
import BC from './components/Breadcrumbs'


const ListItem = List.Item;
const Brief = ListItem.Brief;


const getMediaIcon = (media, idx) => {
  const [main, type] = media.split('/');

  let code = null;

  switch (main) {
    case 'application': code = '\ue65f'; break;
    case 'audio': code = '\ue677'; break;
    case 'video': code = '\ue66b'; break;
    case 'text': code = '\ue6b8'; break;
    case 'image': code = '\ue674'; break;
    default: code = '\ue63a';
  }

  switch (type) {
    case 'pdf':
    case 'doc':
    case 'docx': code = '\ue6b8'; break;
    case 'xls':
    case 'xlsx': code = '\ue664'; break;
  }

  return <Icon type={code} />
}

const getMediaLabel = (media, idx) => {
  const [main, type] = media.split('/');

  let code = null;
  switch (main) {
    case 'application': code = 'Executável'; break;
    case 'audio': code = 'Áudio'; break;
    case 'video': code = 'Vídeo'; break;
    case 'text': code = 'Texto'; break;
    case 'image': code = 'Imagem'; break;
  }

  switch (type) {
    case 'pdf':
    case 'doc':
    case 'docx': code = 'Documento de texto'; break;
    case 'xls':
    case 'xlsx': code = 'Planilha'; break;
  }


  return code != null ? (code + ' ' + type.toUpperCase()) : null;
}


const Midias = ({ value, color }) => {
  //   const unicos = value.filter(function(item, pos) {

  //     return value.findIndex(v => v.media == item.media) == pos;
  // })
  return <View>
    <View style={{ flexWrap: 'wrap', alignItems: 'flex-start', flexDirection: 'row' }}>
      <Brief style={{color}} >Formatos de saída: </Brief>
      <View accessibilityLabel={'Leitor de tela'}><Icon style={{ padding: 5, color }} type={'\uE698'} /></View>
      {value.map((v, idx) => <View key={idx} accessibilityLabel={getMediaLabel(v)}>{getMediaIcon(v)}</View>)}
    </View>
  </View>
}

class App extends Component {

  initialFocus = null;

  state = {
    anatomps: [],
    loading: true,
    open: true,
  }

  componentDidMount() {
    this.onGetData();
  }


  render() {
    const { anatomps, msg, loading } = this.state;
    const { navigation, screenProps } = this.props;

    const selected = screenProps.anatomp != null ? screenProps.anatomp._id : false

    return (
      <Container navigation={navigation} refreshing={loading} onRefresh={this.onGetData} >
        <BC _ref={r => this.initialFocus = r} head='Roteiros' acc='Prossiga para acessar a lista de roteiros' />
        <List accessibilityLabel={`Roteiros de Aprendizagem. Lista com ${anatomps.length} itens. Prossiga para escolher um roteiro`} renderHeader={() => 'Roteiros de aprendizagem'}>
          {
            anatomps.map(anatomp => {
              const color = selected == anatomp._id ? '#108ee9' : '#00000070'
              return (
                <ListItem
                  onClick={this.onSelectRoteiro(anatomp)}
                  style={{backgroundColor: selected == anatomp._id ? '#108ee930' : '#fff'}}
                  key={anatomp.roteiro._id}
                  wrap
                  multipleLine
                  align="center"
                  arrow="horizontal"
                >
                  <Text style={{fontWeight: 'bold', fontSize: 15, color}} accessibilityLabel={'Roteiro. ' + anatomp.nome}>{anatomp.nome}</Text>
                  <Brief style={{color}}>{anatomp.roteiro.curso} | {anatomp.roteiro.disciplina} | {anatomp.instituicao}</Brief>
                  <Text accessibilityLabel='Toque duas vezes para selecionar.'></Text>
                  <Midias color={color} value={anatomp.roteiro.resumoMidias} />
                </ListItem>
              )
            })
          }
        </List>
      </Container>
    );
  }



  onGetData = () => {
    announceForAccessibility('Carregando...');
    Toast.loading('Carregando...', 0)

    fetch('https://frozen-thicket-97625.herokuapp.com/anatomp', {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
    })
      .then(r => r.json())
      .then(r => {
        Toast.hide()
        setTimeout(() => { focusOnView(this.initialFocus) }, 300)
        if (r.status == 200) {
          this.setState({ anatomps: r.data })
        } else {
          throw r.error
        }
      })
      .catch(e => {
        const msg = typeof e == 'string' ? e : 'Não foi possível obter os roteiros de aprendizagem'
        Toast.hide()
        Toast.fail(msg)
        announceForAccessibility(msg)
      })
      .finally(() => this.setState({ loading: false }))    
  }


  onSelectRoteiro = roteiro => () => {
    const { navigation, screenProps } = this.props;
    screenProps.onSelectRoteiro(roteiro);
    navigation.navigate('Roteiro')
  }
}

const styles = StyleSheet.create({
  listItemTitle: {
    fontWeight: 'bold',
    fontSize: 15
  }
});


export default App;