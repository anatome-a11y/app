import React, { Component } from 'react';

import { View, Text, StyleSheet, Scroll, Switch } from 'react-native';
import Container from './Container';

import List from 'antd-mobile-rn/lib/list';
import Flex from 'antd-mobile-rn/lib/flex';
import Tag from 'antd-mobile-rn/lib/tag';
import Checkbox from 'antd-mobile-rn/lib/checkbox';
import Slider from 'antd-mobile-rn/lib/slider';
import BC from './components/Breadcrumbs'

import { announceForAccessibility, focusOnView } from 'react-native-accessibility';

const { CheckboxItem } = Checkbox;

import { Simple as Option } from './components/Option'

class Config extends Component {

    initialFocus = null;

    componentDidMount(){
        setTimeout(() => {
            focusOnView(this.initialFocus)
        }, 500)        
    }

    render() {
        const { navigation, screenProps } = this.props;
        const { config, inputConfig } = screenProps;
        const isAcc = config.indexOf('talkback') != -1;

        return (
            <Container navigation={navigation}>
            <BC _ref={r => this.initialFocus = r} body={[]} head={'Configurações'} acc='Prossiga para ajustar as configurações' />
                {/* <Text accessibilityLabel='Configurações de entrada' style={styles.subTitle}>Entrada</Text> */}
                <List accessibilityLabel='Configurações de Entrada. Prossiga para alterá-las' renderHeader={() => 'Entrada'} style={{ marginBottom: 15 }}>
                    <List.Item>
                        <Option
                            checked={config.indexOf('nfc') != -1}
                            onChange={this.onChange('nfc', 'Leitura de etiquetas com NFC', config.indexOf('nfc') != -1)}
                            label='Leitura de etiquetas com NFC'
                        />
                    </List.Item>
                    <List.Item>
                        <Option
                            checked={config.indexOf('voz') != -1}
                            onChange={this.onChange('voz', 'Inserção de texto por voz', config.indexOf('voz') != -1)}
                            label='Inserção de texto por voz'
                        />
                    </List.Item>
                </List>
                {/* <Text accessibilityLabel='Configurações de saída' style={styles.subTitle}>Saída</Text> */}
                <List accessibilityLabel='Configurações de saída. Prossiga para alterá-las' renderHeader={() => 'Saída'}>
                    <List.Item>
                        <View accessible={true} accessibilityLabel={`Leitor de tela. ${isAcc ? 'Ativado' : 'Desativado'}`}>
                            {isAcc ? <Text style={{ flex: 2 }}>Leitor de tela: Ativado</Text> : (
                            <Flex>
                                <Text style={{ flex: 2 }}>Leitor de tela</Text>
                                <View style={{ flex: 1 }}><Tag size='small'><Text>Desativado<Text style={{ color: '#108ee9' }}>*</Text></Text></Tag></View>
                            </Flex>                                
                            )}
                        </View>
                    </List.Item>
                    <List.Item>
                        <Option
                            checked={config.indexOf('video_imagem') != -1}
                            onChange={this.onChange('video_imagem', 'Imagem e Vídeo', config.indexOf('video_imagem') != -1)}
                            label='Imagem e Vídeo'
                        />
                    </List.Item>
                </List>
                {!isAcc && <Text style={{ marginTop: 5, fontSize: 12 }}><Text style={{ color: '#108ee9' }}>*</Text> Talkback (Android) ou VoiceOver (iOS) desativado no sistema do dispositivo</Text>}
                <List accessibilityLabel='Configurações de interação. Prossiga para alterá-las' style={{ marginTop: 15 }} renderHeader={() => 'Interação'}>
                    <List.Item>
                        <View accessible accessibilityLabel={`Tempo máximo. ${inputConfig.tempo} segundos. Prossiga para alterar o valor.`}>
                            {isAcc ? <Text>Tempo máximo: {inputConfig.tempo} segundos</Text>  : (
                                <Flex>
                                <Text style={{ flex: 3 }}>Tempo máximo</Text>
                                <View style={{ flex: 1 }}><Tag size='small'>{inputConfig.tempo}</Tag></View>
                            </Flex>
                            )}
                        </View>
                        <Slider min={30} max={150} step={15} value={inputConfig.tempo} onChange={this.onChangeInputConfig('tempo', 'Tempo máximo', 'segundos')} />
                    </List.Item>
                    <List.Item>
                        <View accessible accessibilityLabel={`Máximo de tentativas. ${inputConfig.chances}. Prossiga para alterar o valor.`}>
                        {isAcc ? <Text>Máximo de entativas: {inputConfig.chances}</Text> : (
                        <Flex>
                            <Text style={{ flex: 3 }}>Máximo de entativas</Text>
                            <View style={{ flex: 1 }}><Tag size='small'>{inputConfig.chances}</Tag></View>
                        </Flex>                            
                        )}                        
                        </View>
                        <Slider min={1} max={5} step={1} value={inputConfig.chances} onChange={this.onChangeInputConfig('chances', 'Máximo de tentativas', '')} />
                    </List.Item>
                </List>
            </Container>
        )
    }


    onChangeInputConfig = (key, name, unidade) => v => {
        this.props.screenProps.onChangeInputConfig(key)(v);
        announceForAccessibility(`${name} ajustado para ${v} ${unidade}`)
    }

    onChange = (key, name, checked) => () => {
        this.props.screenProps.onChangeConfig(key)
        announceForAccessibility(checked ? `Seleção removida de ${name}` : `${name} selecionado`)
    }
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