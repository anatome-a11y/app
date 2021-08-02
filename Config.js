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
                        <View accessible accessibilityLabel={`Tempo base. ${inputConfig.tempoBase} segundos. Prossiga para alterar o valor.`}>
                            {isAcc ? <Text>Tempo base: {inputConfig.tempoBase} segundos</Text>  : (
                            <Flex>
                                <Text style={{ flex: 3 }}>Tempo base</Text>
                                <View style={{ flex: 1 }}><Tag size='small'>{inputConfig.tempoBase}</Tag></View>
                            </Flex>
                            )}
                        </View>
                        <Slider min={30} max={150} step={15} value={inputConfig.tempoBase} onChange={this.onChangeInputConfig('tempoBase', 'Tempo base', 'segundos')} />
                    </List.Item>

                    <List.Item>
                        <View accessible accessibilityLabel={`Tempo de leitura por caractere . ${inputConfig.tempoLeituraPorCaractere} segundos. Prossiga para alterar o valor.`}>
                            {isAcc ? <Text>Tempo de leitura por caractere: {inputConfig.tempoLeituraPorCaractere} segundos</Text>  : (
                            <Flex>
                                <Text style={{ flex: 3 }}>Tempo de leitura por caractere</Text>
                                <View style={{ flex: 1 }}><Tag size='small'>{inputConfig.tempoLeituraPorCaractere}</Tag></View>
                            </Flex>
                            )}


                        </View>
                        <Slider min={0.1} max={1} step={0.1} value={inputConfig.tempoLeituraPorCaractere} onChange={this.onChangeInputConfig('tempoLeituraPorCaractere', 'Tempo de leitura por caractere', 'segundos')} />
                    </List.Item>

                    <List.Item>
                        <View accessible accessibilityLabel={`Tempo de digitação por caractere . ${inputConfig.tempoDigitacaoPorCaractere} segundos. Prossiga para alterar o valor.`}>
                            {isAcc ? <Text>Tempo de digitação por caractere: {inputConfig.tempoDigitacaoPorCaractere} segundos</Text>  : (
                            <Flex>
                                <Text style={{ flex: 3 }}>Tempo de digitação por caractere</Text>
                                <View style={{ flex: 1 }}><Tag size='small'>{inputConfig.tempoDigitacaoPorCaractere}</Tag></View>
                            </Flex>
                            )}


                        </View>
                        <Slider min={0.5} max={5} step={0.1} value={inputConfig.tempoDigitacaoPorCaractere} onChange={this.onChangeInputConfig('tempoDigitacaoPorCaractere', 'Tempo de digitção por caractere', 'segundos')} />
                    </List.Item>

                    <List.Item>
                        <View accessible accessibilityLabel={`Tempo de fala por caractere . ${inputConfig.tempoFalaPorCaractere} segundos. Prossiga para alterar o valor.`}>
                            {isAcc ? <Text>Tempo de fala por caractere: {inputConfig.tempoFalaPorCaractere} segundos</Text>  : (
                            <Flex>
                                <Text style={{ flex: 3 }}>Tempo de fala por caractere</Text>
                                <View style={{ flex: 1 }}><Tag size='small'>{inputConfig.tempoFalaPorCaractere}</Tag></View>
                            </Flex>
                            )}


                        </View>
                        <Slider min={0.3} max={1} step={0.1} value={inputConfig.tempoFalaPorCaractere} onChange={this.onChangeInputConfig('tempoFalaPorCaractere', 'Tempo de digitção por caractere', 'segundos')} />
                    </List.Item>


                    <List.Item>
                        <View accessible accessibilityLabel={`Máximo de tentativas. ${inputConfig.chances}. Prossiga para alterar o valor.`}>
                        {isAcc ? <Text>Máximo de entativas: {inputConfig.chances}</Text> : (
                        <Flex>
                            <Text style={{ flex: 3 }}>Máximo de tentativas</Text>
                            <View style={{ flex: 1 }}><Tag size='small'>{inputConfig.chances}</Tag></View>
                        </Flex>                            
                        )}                        
                        </View>
                        <Slider min={1} max={5} step={1} value={inputConfig.chances} onChange={this.onChangeInputConfig('chances', 'Máximo de tentativas', '')} />
                    </List.Item>
                    <List.Item>
                        <Option
                            checked={config.indexOf('textoAlternativo') != -1}
                            onChange={this.onChange('textoAlternativo', 'Permitir sugestões alternativas para transcrição de voz', config.indexOf('textoAlternativo') != -1)}
                            label='Permitir sugestões alternativas para transcrição de voz'
                        />
                    </List.Item>                    
                </List>
            </Container>
        )
    }


    onChangeInputConfig = (key, name, unidade) => v => {
        const roundValues = [
            'tempoLeituraPorCaractere',
            'tempoDigitacaoPorCaractere',
            'tempoFalaPorCaractere'
        ];

        if(roundValues.includes(key)) {
            v = Math.round(v * 10) / 10
        }


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