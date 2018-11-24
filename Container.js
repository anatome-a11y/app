import React, { Component } from 'react';
import { StyleSheet, ScrollView, View, Text, RefreshControl, KeyboardAvoidingView } from 'react-native';

import Icon from 'antd-mobile-rn/lib/icon';
import Button from 'antd-mobile-rn/lib/button';
import Flex from 'antd-mobile-rn/lib/flex';
import {version} from './package.json'

const FlexItem = Flex.Item;
const _fechar = '\ue633';


class Container extends Component {

  scroll = null;

  componentWillReceiveProps(next) {
    if (this.props.sinalScroll != next.sinalScroll) {
      this.scroll.scrollTo({ y: 0 })
    }
  }

  render() {
    const { children, footer, onRefresh, refreshing } = this.props;

    return (
      <View style={styles.container}>
        <Flex>
          <FlexItem><Button accessibilityLabel={this.getAcc('Ajuda')} onPressOut={this.onNavigate('Ajuda')} ><Icon type={this.getIcone('Ajuda', '\ue63c')} size='md' /></Button></FlexItem>
          <FlexItem style={styles.spacer}>{this.getTitle()}</FlexItem>
          <FlexItem><Button accessibilityLabel={this.getAcc('Config')} onPressOut={this.onNavigate('Config')}><Icon type={this.getIcone('Config', '\ue672')} size='md' /></Button></FlexItem>
        </Flex>
        <KeyboardAvoidingView style={styles.scroll}>
          <ScrollView
            ref={r => this.scroll = r}
            contentContainerStyle={{ flexGrow: 1 }}
            refreshControl={onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} /> : undefined }
          >
            <View style={{ flex: 10, padding: 5, marginBottom: 30 }}>
              {children}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
        <Flex style={{ marginBottom: 5 }}>
          <FlexItem><Button accessibilityLabel={this.getAcc('Contexto')} ><Icon type={'\ue616'} size='md' /></Button></FlexItem>
          <FlexItem style={styles.spacer}>
            <Text style={{textAlign: 'center'}}>Versão {version}</Text>
          </FlexItem>
          <FlexItem><Button accessibilityLabel={this.getAcc('Info')} onPressOut={this.onNavigate('Info')}><Icon type={this.getIcone('Info', '\ue629')} size='md' /></Button></FlexItem>
        </Flex>
      </View>
    );
  }


  getAcc = (tela) => {
    const { navigation } = this.props;

    if (navigation.state.routeName == tela) {
      switch (tela) {
        case 'Ajuda': return 'Fechar Ajuda geral. Botão';
        case 'Config': return 'Fechar Configurações. Botão';
        case 'Info': return 'Fechar Informações da peça física. Botão';
      }
    } else {
      switch (tela) {
        case 'Ajuda': return 'Abrir Ajuda geral. Botão';
        case 'Config': return 'Abrir Configurações. Botão';
        case 'Contexto': return 'Ouvir contexto. Botão';
        case 'Info': return 'Abrir informações do roteiro Botão';
      }
    }
  }


  getTitle = () => {
    const { navigation } = this.props;

    switch (navigation.state.routeName) {
      case 'Info': return <Text accessibilityLabel='Informações. Título' style={styles.title}>Informações</Text>;
      case 'Ajuda': return <Text accessibilityLabel='Ajuda. Título' style={styles.title}>Ajuda</Text>;
      case 'Config': return <Text accessibilityLabel='Configurações. Título' style={styles.title}>Configurações</Text>;
      case 'Roteiro': return <Text accessibilityLabel='Interações. Título' style={styles.title}>Interações</Text>;
      default: return <Text accessibilityLabel='anatom P. Título' style={styles.title}>Anatome-AT</Text>;
    }
  }


  onNavigate = mode => () => {
    const { navigation } = this.props;

    if (navigation.state.routeName == mode) {
      navigation.goBack();
    } else {
      navigation.navigate(mode)
    }
  }

  getIcone = (mode, icon) => {
    const { navigation } = this.props;

    if (navigation.state.routeName == mode) {
      return _fechar;
    } else {
      return icon
    }
  }

}


Container.defaultProps = {
  footer: null,
  disabled: [],
  onRefresh: false
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 5,
    paddingBottom: 0
  },
  spacer: {
    flex: 3
  },
  title: {
    textAlign: 'center',
    fontSize: 25
  },
  scroll: {
    paddingTop: 5,
    paddingBottom: 5,
    flex: 3,
  }
});


export default Container;