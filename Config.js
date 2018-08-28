import React, { Component } from 'react';

import { View, Text, StyleSheet, Scroll } from 'react-native';
import Container from './Container';

import List from 'antd-mobile-rn/lib/list';
import Checkbox from 'antd-mobile-rn/lib/checkbox';

const { CheckboxItem } = Checkbox;

class Config extends Component {
    render() {
        const { navigation, screenProps} = this.props;
        const {config} = screenProps;

        return (
            <Container navigation={navigation}>
                <Text style={styles.subTitle}></Text>
                <List renderHeader={() => 'Texto'}>
                    <CheckboxItem checked={config.indexOf('texto.escrito') != -1} onChange={this.onChange('texto.escrito')}>
                        <Text>Texto escrito</Text>
                    </CheckboxItem>                   
                </List>                
                <List renderHeader={() => 'Áudio'}>
                    <CheckboxItem checked={config.indexOf('audio.professor') != -1} onChange={this.onChange('audio.professor')}>
                        <Text>Áudio do professor</Text>
                    </CheckboxItem>
                    <CheckboxItem checked={config.indexOf('audio.texto') != -1} onChange={this.onChange('audio.texto')}>
                        <Text>Texto convertido em áudio</Text>
                    </CheckboxItem>                    
                </List>
                <List renderHeader={() => 'Vídeo'}>
                    <CheckboxItem checked={config.indexOf('video.audioPT') != -1} onChange={this.onChange('video.audioPT')}>
                        <Text>Áudio em português</Text>
                    </CheckboxItem>
                    <CheckboxItem checked={config.indexOf('video.legPT') != -1} onChange={this.onChange('video.legPT')}>
                        <Text>Legenda em português</Text>
                    </CheckboxItem>   
                    <CheckboxItem checked={config.indexOf('video.libras') != -1} onChange={this.onChange('video.libras')}>
                        <Text>Vídeo em libras</Text>
                    </CheckboxItem> 
                    <CheckboxItem checked={config.indexOf('video.interprete') != -1} onChange={this.onChange('video.interprete')}>
                        <Text>Janela de intérprete</Text>
                    </CheckboxItem> 
                    <CheckboxItem checked={config.indexOf('video.audioDesc') != -1} onChange={this.onChange('video.audioDesc')}>
                        <Text>Áudio descrição</Text>
                    </CheckboxItem>                                                                                 
                </List>                
            </Container>
        )
    }

    onChange = key => () => this.props.screenProps.onChangeConfig(key)
}

const styles = StyleSheet.create({
    subTitle: {
      textAlign: 'center',
      fontSize: 15
    },
  });
  

export default Config;