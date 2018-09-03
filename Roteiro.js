import React, { Component } from 'react';

import { View, Text, Switch } from 'react-native';
import Container from './Container';

import Accordion from 'antd-mobile-rn/lib/accordion';
import List from 'antd-mobile-rn/lib/list';
import Button from 'antd-mobile-rn/lib/button';
import Flex from 'antd-mobile-rn/lib/flex';

import Checkbox from 'antd-mobile-rn/lib/checkbox';
const ListItem = List.Item;

const { CheckboxItem } = Checkbox;
const { Panel } = Accordion;



class Roteiro extends Component {

    state = {
        active: '0'
    }


    componentWillReceiveProps(next) {
        const { tipoConteudo, modoAprendizagem, sentidoIdentificacao } = this.props.screenProps.modoInteracao;

        if (tipoConteudo != next.screenProps.modoInteracao.tipoConteudo) {
            this.setState({ active: '1' })
        }

        if (modoAprendizagem != next.screenProps.modoInteracao.modoAprendizagem) {
            this.setState({ active: '2' })
        }
    }


    render() {
        const { active } = this.state;
        const { navigation, screenProps } = this.props;
        const { tipoConteudo, modoAprendizagem, sentidoIdentificacao } = screenProps.modoInteracao;

        const { anatomp } = screenProps;
        const isComplete = tipoConteudo != '' && modoAprendizagem != '' && sentidoIdentificacao != '';

        return (
            <Container navigation={navigation}>
                <List style={{ marginBottom: 10 }} >
                    <ListItem wrap multipleLine accessibilityLabel={`Roteiro: ${anatomp.nome}`}>
                        {anatomp.nome}
                    </ListItem>
                </List>
                <Accordion style={{ backgroundColor: '#f5f5f9' }} onChange={active => this.setState({ active })} activeKey={active}>
                    <Panel
                        style={{ justifyContent: 'space-between', padding: 10, color: '#000' }}
                        header={<Text accessibilityLabel={`Seleção do Tipo de conteúdo. ${active == '0' ? 'Expandido' : 'Toque duas vezes para expandir'}`}>Tipo de conteúdo</Text>}
                    >
                        <List>
                            <List.Item wrap multipleLine>
                                <View>
                                    <Text accessibilityLabel={`Tipo de conteúdo. prático`} style={{ fontWeight: 'bold' }}>Prático: </Text><Text>Identificação anatômica por nome</Text>
                                    <Switch accessibilityLabel={`Tipo de conteúdo prático`} value={tipoConteudo == 'pratico'} onValueChange={this.onChange('tipoConteudo', 'pratico')} />
                                </View>
                            </List.Item>
                            <List.Item wrap multipleLine>
                                <View>
                                    <Text accessibilityLabel={`Tipo de conteúdo. Teórico`} style={{ fontWeight: 'bold' }}>Teórico: </Text><Text>Identificação anatômica por informações teóricas associadas</Text>
                                    <Switch accessibilityLabel={`Tipo de conteúdo Teórico`} value={tipoConteudo == 'teorico'} onValueChange={this.onChange('tipoConteudo', 'teorico')} />
                                </View>
                            </List.Item>
                        </List>
                    </Panel>
                    <Panel
                        style={{ justifyContent: 'space-between', padding: 10, color: '#000' }}
                        header={<Text accessibilityLabel={`Seleção do Modo de aprendizagem. ${active == '1' ? 'Expandido' : 'Toque duas vezes para expandir'}`}>Modo de aprendizagem</Text>}
                    >
                        <List>
                            <List.Item>
                                <View>
                                    <Text style={{ fontWeight: 'bold' }}>Estudo: </Text><Text>Você seleciona uma parte anatômica e o sistema te informa o conteúdo correspondente.</Text>
                                    <Switch value={modoAprendizagem == 'estudo'} onValueChange={this.onChange('modoAprendizagem', 'estudo')} />
                                </View>
                            </List.Item>
                            <List.Item>
                                <View>
                                    <Text style={{ fontWeight: 'bold' }}>Treinamento: </Text><Text>O sistema te informa um conteúdo e você indica a parte anatômica correspondente.</Text>
                                    <Switch value={modoAprendizagem == 'treinamento'} onValueChange={this.onChange('modoAprendizagem', 'treinamento')} />
                                </View>
                            </List.Item>
                        </List>
                    </Panel>
                    <Panel
                        style={{ justifyContent: 'space-between', padding: 10, color: '#000' }}
                        header={<Text accessibilityLabel={`Seleção do Sentido de identificação. ${active == '2' ? 'Expandido' : 'Toque duas vezes para expandir'}`}>Sentido de identificação</Text>}
                    >
                        <List>
                            <List.Item>
                                <View>
                                    <Text accessibilityLabel='Localizar.' style={{ fontWeight: 'bold' }}>Localizar: </Text><Text accessibilityLabel='Partindo-se do nome ou teoria, encontra-se a localização da parte' >Sentido: Nome/teoria -> Localização</Text>
                                    <Switch value={sentidoIdentificacao == 'localizar'} onValueChange={this.onChange('sentidoIdentificacao', 'localizar')} />
                                </View>
                            </List.Item>
                            <List.Item>
                                <View>
                                    <Text accessibilityLabel='Nomear.' style={{ fontWeight: 'bold' }}>Nomear: </Text><Text accessibilityLabel='Partindo-se da localização da parte define-se o nome ou a informação teórica correta'>Sentido: Localização -> Nome/teoria</Text>
                                    <Switch value={sentidoIdentificacao == 'nomear'} onValueChange={this.onChange('sentidoIdentificacao', 'nomear')} />
                                </View>
                            </List.Item>
                        </List>
                    </Panel>
                </Accordion>
                <Flex style={{ marginTop: 15 }}>
                    {/* <Button onPressOut={() => navigation.goBack()} style={{ flex: 1 }}><Text>Voltar</Text></Button> */}
                    <Button accessibilityLabel='Iniciar interação. Botão. Pressione duas vezes para iniciar.' onPressOut={this.onStart} style={{ flex: 1 }} disabled={!isComplete} type='primary'><Text>Iniciar</Text></Button>
                </Flex>
            </Container>
        )
    }

    onStart = () => {
        const { navigation, screenProps } = this.props;
        const { tipoConteudo, modoAprendizagem, sentidoIdentificacao } = screenProps.modoInteracao;

        const key = tipoConteudo + '-' + modoAprendizagem + '-' + sentidoIdentificacao;
        switch (key) {
            case 'pratico-estudo-localizar': break;
            case 'pratico-estudo-nomear': break;
            case 'pratico-treinamento-localizar': break;
            case 'pratico-treinamento-nomear': break;
            case 'teorico-estudo-localizar': break;
            case 'teorico-estudo-nomear': break;
            case 'teorico-treinamento-localizar':
                navigation.navigate('TeoTreLoc')
                break;
            case 'teorico-treinamento-nomear': break;
        }

    }

    onChange = (field, value) => () => this.props.screenProps.onChangeModoInteracao(field, value)
}

export default Roteiro;