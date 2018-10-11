import React, { Component } from 'react';

import { View, Text, StyleSheet, Scroll, Switch } from 'react-native';
import Container from './Container';

import List from 'antd-mobile-rn/lib/list';
import Flex from 'antd-mobile-rn/lib/flex';
import Tag from 'antd-mobile-rn/lib/tag';
import Checkbox from 'antd-mobile-rn/lib/checkbox';
import Slider from 'antd-mobile-rn/lib/slider';

const { CheckboxItem } = Checkbox;

import Option from './components/Option'

class Config extends Component {
    render() {
        const { navigation, screenProps } = this.props;
        const { config, inputConfig, onChangeInputConfig } = screenProps;


        return (
            <Container navigation={navigation}>
                {/* <Text accessibilityLabel='Configurações de entrada' style={styles.subTitle}>Entrada</Text> */}
                <List renderHeader={() => 'Entrada'} style={{ marginBottom: 15 }}>
                    <List.Item>
                        <Option
                            checked={config.indexOf('nfc') != -1}
                            onChange={this.onChange('nfc')}
                        >
                            Leitura de etiquetas com NFC
                                </Option>
                    </List.Item>
                    <List.Item>
                        <Option
                            checked={config.indexOf('voz') != -1}
                            onChange={this.onChange('voz')}
                        >
                            Inserção de texto por voz
                        </Option>
                    </List.Item>
                </List>
                {/* <Text accessibilityLabel='Configurações de saída' style={styles.subTitle}>Saída</Text> */}
                <List renderHeader={() => 'Saída'}>
                    <List.Item>
                        <Flex>
                            <Text style={{flex: 2}}>Leitor de tela</Text>
                            <View style={{flex: 1}}><Tag size='small'>{config.indexOf('talkback') != -1 ? 'Ativado' : <Text>Desativado<Text style={{ color: '#108ee9' }}>*</Text></Text>}</Tag></View>
                        </Flex>
                    </List.Item>
                    <List.Item>
                        <Option
                            checked={config.indexOf('video') != -1}
                            onChange={this.onChange('video')}
                        >
                            Vídeo
                        </Option>
                    </List.Item>                    
                </List>
                <Text style={{marginTop: 5, fontSize: 12}}><Text style={{ color: '#108ee9' }}>*</Text> Talkback (Android) ou VoiceOver (iOS) desativado no sistema do dispositivo</Text>
                <List style={{ marginTop: 15 }} renderHeader={() => 'Interação'}>
                    <List.Item>
                        <Flex>
                            <Text style={{flex: 3}}>Tempo máximo</Text>
                            <View style={{flex: 1}}><Tag size='small'>{inputConfig.tempo}</Tag></View>
                        </Flex>
                        <Slider min={30} max={150} step={15} value={inputConfig.tempo} onChange={onChangeInputConfig('tempo')} />
                    </List.Item>
                    <List.Item>
                        <Flex>
                            <Text style={{flex: 3}}>Chances</Text>
                            <View style={{flex: 1}}><Tag size='small'>{inputConfig.chances}</Tag></View>
                        </Flex>
                        <Slider min={1} max={5} step={1} value={inputConfig.chances} onChange={onChangeInputConfig('chances')} />
                    </List.Item>                  
                </List>                
            </Container>
        )
    }

    onChange = key => () => this.props.screenProps.onChangeConfig(key)
}

const styles = StyleSheet.create({
    subTitle: {
        textAlign: 'center',
        fontSize: 20,
        marginBottom: 10,
        marginTop: 5,
    },
});


export default Config;