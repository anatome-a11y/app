import React, { Component } from 'react';
import { StyleSheet, ScrollView, View, Text, Image } from 'react-native';

import Icon from 'antd-mobile-rn/lib/icon';
import Button from 'antd-mobile-rn/lib/button';
import Flex from 'antd-mobile-rn/lib/flex';

const FlexItem = Flex.Item;
const _fechar = '\ue633';


class Container extends Component {


  render() {
    const { children, navigation, footer } = this.props;

    return (
      <View style={styles.container}>
        <Flex>
          <FlexItem><Button onPressOut={this.onNavigate('Ajuda')} ><Icon type={this.getIcone('Ajuda', '\ue63c')} size='md' /></Button></FlexItem>
          <FlexItem style={styles.spacer}><Text style={styles.title}>{this.getTitle()}</Text></FlexItem>
          <FlexItem><Button onPressOut={this.onNavigate('Config')}><Icon type={this.getIcone('Config', '\ue672')} size='md' /></Button></FlexItem>
        </Flex>
        <ScrollView style={styles.scroll}>
            {children}
        </ScrollView>
        <Flex>
          <FlexItem><Button><Icon type={'\ue616'} size='md' /></Button></FlexItem>
          <FlexItem style={styles.spacer}>
            {footer}
          </FlexItem>
          <FlexItem><Button><Icon type={'\ue629'} size='md' /></Button></FlexItem>
        </Flex>
      </View>
    );
  }


  getTitle = () => {
      const {navigation} = this.props;

      switch(navigation.state.routeName){
          case 'Ajuda': return 'Ajuda';
          case 'Config': return 'Configurações';
          case 'Roteiro': return 'Roteiro';
          default: return 'An@tom-P';          
      }
  }


  onNavigate = mode => () => {
      const {navigation} = this.props;

      if(navigation.state.routeName == mode){
        navigation.goBack();
      }else{
        navigation.navigate(mode)
      }
  }

  getIcone = (mode, icon) => {
    const {navigation} = this.props;

    if(navigation.state.routeName == mode){
      return _fechar;
    }else{
      return icon
    }
}  

}


Container.defaultProps = {
  footer: null
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 5,
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
    flex: 3
  }  
});


export default Container;