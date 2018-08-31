import React, { Component } from 'react';

import { View, Text } from 'react-native';
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
                <List style={{marginBottom: 10}}>
                    <ListItem
                        wrap
                        multipleLine
                    >
                        {anatomp.nome}
                    </ListItem>
                </List>
                <Accordion style={{ backgroundColor: '#f5f5f9' }} onChange={active => this.setState({ active })} activeKey={active}>
                    <Panel header="Tipo de conteúdo">
                        <List>
                            <CheckboxItem checked={tipoConteudo == 'pratico'} onChange={this.onChange('tipoConteudo', 'pratico')}>
                                <Text style={{ fontWeight: 'bold' }}>Prático: </Text><Text>Identificação anatômica por nome</Text>
                            </CheckboxItem>
                            <CheckboxItem checked={tipoConteudo == 'teorico'} onChange={this.onChange('tipoConteudo', 'teorico')}>
                                <Text style={{ fontWeight: 'bold' }}>Teórico: </Text><Text>Identificação anatômica por informações teóricas associadas</Text>
                            </CheckboxItem>
                        </List>
                    </Panel>
                    <Panel header="Modo de aprendizagem">
                        <List>
                            <CheckboxItem checked={modoAprendizagem == 'estudo'} onChange={this.onChange('modoAprendizagem', 'estudo')}>
                                <Text style={{ fontWeight: 'bold' }}>Estudo: </Text><Text>Você seleciona uma parte anatômica e o sistema te informa o conteúdo correspondente.</Text>
                            </CheckboxItem>
                            <CheckboxItem checked={modoAprendizagem == 'treinamento'} onChange={this.onChange('modoAprendizagem', 'treinamento')}>
                                <Text style={{ fontWeight: 'bold' }}>Treinamento: </Text><Text>O sistema te informa um conteúdo e você indica a parte anatômica correspondente.</Text>
                            </CheckboxItem>
                        </List>
                    </Panel>
                    <Panel header="Sentido de identificação">
                        <List>
                            <CheckboxItem checked={sentidoIdentificacao == 'localizar'} onChange={this.onChange('sentidoIdentificacao', 'localizar')}>
                                <Text style={{ fontWeight: 'bold' }}>Localizar: </Text><Text>Sentido: Nome/teoria -> Localização</Text>
                            </CheckboxItem>
                            <CheckboxItem checked={sentidoIdentificacao == 'nomear'} onChange={this.onChange('sentidoIdentificacao', 'nomear')}>
                                <Text style={{ fontWeight: 'bold' }}>Nomear: </Text><Text>Sentido: Localização -> Nome/teoria</Text>
                            </CheckboxItem>
                        </List>
                    </Panel>
                </Accordion>
                <Flex style={{ marginTop: 15 }}>
                    {/* <Button onPressOut={() => navigation.goBack()} style={{ flex: 1 }}><Text>Voltar</Text></Button> */}
                    <Button onPressOut={this.onStart} style={{ flex: 1 }} disabled={!isComplete} type='primary'><Text>Iniciar</Text></Button>
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