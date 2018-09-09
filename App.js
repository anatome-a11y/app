import React, { Component, Fragment } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import Icon from 'antd-mobile-rn/lib/icon';
import List from 'antd-mobile-rn/lib/list';
import Flex from 'antd-mobile-rn/lib/flex';
import Toast from 'antd-mobile-rn/lib/toast';

import { announceForAccessibility, focusOnView } from 'react-native-accessibility';

import Container from './Container'


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
    default: code = '';
  }

  switch (type) {
    case 'pdf':
    case 'doc':
    case 'docx': code = 'Documento de texto'; break;
    case 'xls':
    case 'xlsx': code = 'Planilha'; break;
  }

  return code + ' ' + type.toUpperCase();
}


const Midias = ({ value }) => {
  return value.length == 0 ? <Text>Nenhuma mídia associada</Text> : (
    <Flex>
      <Brief style={{ flex: 1 }}>Mídias Associadas: </Brief>
      {value.map((v, idx) => <Text style={{ flex: 1 }} key={idx} accessibilityLabel={getMediaLabel(v)}>{getMediaIcon(v)}</Text>)}
    </Flex>
  )
}

class App extends Component {

  initialFocus = null;

  state = {
    anatomps: [],
    loading: true,
    open: true,
  }

  componentDidMount() {


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
        focusOnView(this.initialFocus) 
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

  render() {
    const { anatomps, msg } = this.state;
    const { navigation } = this.props;

    return (
      <Container navigation={navigation}>        
        <List ref={r => this.initialFocus = r} accessibilityLabel={`Roteiros de Aprendizagem. Lista com ${anatomps.length} itens. Prossiga para escolher um roteiro`} renderHeader={() => 'Roteiros de aprendizagem'}>
          {
            anatomps.map(anatomp => (
              <ListItem
                onClick={this.onSelectRoteiro(anatomp)}
                key={anatomp.roteiro._id}
                wrap
                multipleLine
                align="center"
                arrow="horizontal"
              >
                <Text style={styles.listItemTitle} accessibilityLabel={'Roteiro. ' + anatomp.nome}>{anatomp.nome}</Text>
                <Brief>{anatomp.roteiro.curso}</Brief>
                <Brief>{anatomp.roteiro.disciplina}<Text> - </Text>{anatomp.instituicao}</Brief>
                <Text accessibilityLabel='Toque duas vezes para selecionar.'></Text>
                <Midias value={anatomp.roteiro.resumoMidias} />
              </ListItem>
            ))
          }
        </List>
      </Container>
    );
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