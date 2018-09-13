import React, { Component } from 'react';

import { View, Text, StyleSheet, Scroll, Switch } from 'react-native';
import Container from './Container';

import List from 'antd-mobile-rn/lib/list';
import Flex from 'antd-mobile-rn/lib/flex';
import Checkbox from 'antd-mobile-rn/lib/checkbox';

const { CheckboxItem } = Checkbox;

import Option from './components/Option'

class Config extends Component {
    render() {
        const { navigation, screenProps } = this.props;
        const { config } = screenProps;


        return (
            <Container navigation={navigation}>
                <Text accessibilityLabel='Configurações de entrada' style={styles.subTitle}>Entrada</Text>
                <List renderHeader={() => 'NFC e Voz'} style={{ marginBottom: 15 }}>
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
                <Text accessibilityLabel='Configurações de saída' style={styles.subTitle}>Saída</Text>
                <List renderHeader={() => 'Texto'}>
                    <List.Item >
                        <Flex>
                            <Text style={{ flex: 1 }}>Texto escrito</Text>
                            <Switch accessibilityLabel='Texto escrito' style={{ flex: 1 }} value={config.indexOf('texto.escrito') != -1} onValueChange={this.onChange('texto.escrito')} />
                        </Flex>
                    </List.Item>
                </List>
                <List renderHeader={() => 'Áudio'}>
                    <List.Item >
                        <Flex>
                            <Text style={{ flex: 1 }}>Áudio do professor</Text>
                            <Switch accessibilityLabel='Áudio do professor' style={{ flex: 1 }} value={config.indexOf('audio.professor') != -1} onValueChange={this.onChange('audio.professor')} />
                        </Flex>
                    </List.Item>
                    <List.Item >
                        <Flex>
                            <Text style={{ flex: 1 }}>Texto convertido em áudio</Text>
                            <Switch accessibilityLabel='Texto convertido em áudio' style={{ flex: 1 }} value={config.indexOf('audio.texto') != -1} onValueChange={this.onChange('audio.texto')} />
                        </Flex>
                    </List.Item>
                </List>
                <List renderHeader={() => 'Vídeo'}>
                    <List.Item >
                        <Flex>
                            <Text style={{ flex: 1 }}>Áudio em português</Text>
                            <Switch accessibilityLabel='Áudio em português' style={{ flex: 1 }} value={config.indexOf('video.audioPT') != -1} onValueChange={this.onChange('video.audioPT')} />
                        </Flex>
                    </List.Item>
                    <List.Item >
                        <Flex>
                            <Text style={{ flex: 1 }}>Legenda em português</Text>
                            <Switch accessibilityLabel='Legenda em português' style={{ flex: 1 }} value={config.indexOf('video.legPT') != -1} onValueChange={this.onChange('video.legPT')} />
                        </Flex>
                    </List.Item>
                    <List.Item >
                        <Flex>
                            <Text style={{ flex: 1 }}>Vídeo em libras</Text>
                            <Switch accessibilityLabel='Vídeo em libras' style={{ flex: 1 }} value={config.indexOf('video.libras') != -1} onValueChange={this.onChange('video.libras')} />
                        </Flex>
                    </List.Item>
                    <List.Item >
                        <Flex>
                            <Text style={{ flex: 1 }}>Janela de intérprete</Text>
                            <Switch accessibilityLabel='Janela de intérprete' style={{ flex: 1 }} value={config.indexOf('video.interprete') != -1} onValueChange={this.onChange('video.interprete')} />
                        </Flex>
                    </List.Item>
                    <List.Item >
                        <Flex>
                            <Text style={{ flex: 1 }}>Áudio descrição</Text>
                            <Switch accessibilityLabel='Áudio descrição' style={{ flex: 1 }} value={config.indexOf('video.audioDesc') != -1} onValueChange={this.onChange('video.audioDesc')} />
                        </Flex>
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