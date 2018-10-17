import React, { Component } from 'react';

import { View, Text, Switch } from 'react-native';
import Container from './Container';

import Accordion from 'antd-mobile-rn/lib/accordion';
import List from 'antd-mobile-rn/lib/list';
import Button from 'antd-mobile-rn/lib/button';
import Flex from 'antd-mobile-rn/lib/flex';

import { announceForAccessibility, focusOnView } from 'react-native-accessibility';
import Option from './components/Option'

import BC from './components/Breadcrumbs'


const ListItem = List.Item;

const { Panel } = Accordion;

const getCode = name => name.charAt(0).toUpperCase() + name.slice(1,3)

const getLabel = nm => {
    switch(nm){
        case 'pratico': return 'prático';
        case 'teorico': return 'teórico';
        default: return nm;
    }
}


class Roteiro extends Component {

    initialFocus = null;
    initialFocusTC = null;
    initialFocusMA = null;
    initialFocusSI = null;

    state = {
        active: '0'
    }

    componentDidMount() {
        setTimeout(() => {
            focusOnView(this.initialFocus)
        }, 500)
    }


    componentWillReceiveProps(next) {
        const { tipoConteudo, modoAprendizagem, sentidoIdentificacao } = this.props.screenProps.modoInteracao;

        if (tipoConteudo != next.screenProps.modoInteracao.tipoConteudo) {
            // this.setState({ active: '1' })
        }

        if (modoAprendizagem != next.screenProps.modoInteracao.modoAprendizagem) {
            // this.setState({ active: '2' })
        }
    }

    componentWillUpdate(_, nextState) {
        const { active } = this.state;

        if (active !== '0' && nextState.active == '0') {
            announceForAccessibility('Aberto. Seleção do tipo de conteúdo. Prossiga para selecionar o tipo de conteúdo');
        }

        if (active !== '1' && nextState.active == '1') {
            announceForAccessibility('Aberto. Seleção do modo de aprendizagem. Prossiga para selecionar o modo de aprendizagem');
        }

        if (active !== '2' && nextState.active == '2') {
            announceForAccessibility('Aberto. Seleção do sentido de identificação. Prossiga para selecionar o sentido de identificação');
        }
    }


    render() {
        const { active } = this.state;
        const { navigation, screenProps } = this.props;
        const { tipoConteudo, modoAprendizagem, sentidoIdentificacao } = screenProps.modoInteracao;

        const { anatomp, config } = screenProps;
        const isComplete = tipoConteudo != '' && modoAprendizagem != '' && sentidoIdentificacao != '';

        const exibeSelecionados = config.indexOf('talkback') == -1;

        const accSelected = getLabel(modoAprendizagem) + ', '+ getLabel(tipoConteudo) + ', '+getLabel(sentidoIdentificacao);

        return (
            <Container navigation={navigation}> 
                <BC _ref={r => this.initialFocus = r} body={['Roteiros']} head={anatomp.nome} acc='Prossiga para configurar a interação.' />
                {exibeSelecionados && <Text style={{ padding: 10, paddingTop: 0, textAlign: 'justify', lineHeight: 22 }}>
                    <Text style={{ fontWeight: 'bold'}}>Selecionados: </Text>                    
                    <Text style={{ color: '#108ee9' }}>{modoAprendizagem == 'estudo' ? 'Estudo' : 'Treinamento'}</Text><Text> | </Text>
                    <Text style={{ color: '#108ee9' }}>{tipoConteudo == 'pratico' ? 'Prático' : 'Teórico'}</Text><Text> | </Text>
                    <Text style={{ color: '#108ee9' }}>{sentidoIdentificacao == 'nomear' ? 'Nomear' : 'Localizar'}</Text>
                </Text> }          
                <Accordion style={{ backgroundColor: '#f5f5f9' }} onChange={active => this.setState({ active })} activeKey={active}>
                    <Panel
                        style={{ justifyContent: 'space-between', padding: 10, color: '#000' }}
                        header={<Text accessibilityLabel={`Seleção do Modo de aprendizagem. ${active == '0' ? 'Prossiga para selecionar um modo de aprendizagem' : 'Toque duas vezes para abrir'}`}>Modo de aprendizagem</Text>}
                    >
                        <List>
                            <List.Item wrap multipleLine>
                                <Option
                                    _ref={r => this.initialFocusMA = r}
                                    title='Estudo'
                                    label='Modo de aprendizagem. Estudo'
                                    checked={modoAprendizagem == 'estudo'}
                                    onChange={this.onChange('modoAprendizagem', 'estudo', 'Estudo')}
                                >
                                    Identificação anatômica por informações teóricas associadas
                                </Option>
                            </List.Item>
                            <List.Item wrap multipleLine>
                                <Option
                                    title='Treinamento'
                                    label='Modo de aprendizagem. Treinamento'
                                    checked={modoAprendizagem == 'treinamento'}
                                    onChange={this.onChange('modoAprendizagem', 'treinamento', 'treinamento')}
                                >
                                    O sistema te informa um conteúdo e você indica a parte anatômica correspondente.
                                </Option>
                            </List.Item>
                        </List>
                    </Panel>
                    <Panel
                        style={{ justifyContent: 'space-between', padding: 10, color: '#000' }}
                        header={<Text accessibilityLabel={`Seleção do Tipo de conteúdo. ${active == '1' ? 'Prossiga para selecionar um tipo de conteúdo' : 'Toque duas vezes para abrir'}`}>Tipo de conteúdo</Text>}
                    >
                        <List>
                            <List.Item wrap multipleLine>
                                <Option
                                    _ref={r => this.initialFocusTC = r}
                                    title='Prático'
                                    label='Tipo de conteúdo. Prático'
                                    checked={tipoConteudo == 'pratico'}
                                    onChange={this.onChange('tipoConteudo', 'pratico', 'Prático')}
                                >
                                    Identificação anatômica por nome
                                </Option>
                            </List.Item>
                            <List.Item wrap multipleLine>
                                <Option
                                    title='Teórico'
                                    label='Tipo de conteúdo. Teórico'
                                    checked={tipoConteudo == 'teorico'}
                                    onChange={this.onChange('tipoConteudo', 'teorico', 'Teórico')}
                                >
                                    Identificação anatômica por informações teóricas associadas
                                </Option>
                            </List.Item>
                        </List>
                    </Panel>
                    <Panel
                        style={{ justifyContent: 'space-between', padding: 10, color: '#000' }}
                        header={<Text accessibilityLabel={`Seleção do Sentido de identificação. ${active == '2' ? 'Prossiga para selecionar um sentido de identificação' : 'Toque duas vezes para abrir'}`}>Sentido de identificação</Text>}
                    >
                        <List>
                            <List.Item wrap multipleLine>
                                <Option
                                    _ref={r => this.initialFocusSI = r}
                                    title='Localizar'
                                    label='Sentido de identificação. Localizar'
                                    checked={sentidoIdentificacao == 'localizar'}
                                    onChange={this.onChange('sentidoIdentificacao', 'localizar', 'Localizar')}
                                >
                                    Partindo-se do nome ou teoria, encontra-se a localização da parte
                                </Option>
                            </List.Item>
                            <List.Item wrap multipleLine>
                                <Option
                                    title='Nomear'
                                    label='Sentido de identificação. Nomear'
                                    checked={sentidoIdentificacao == 'nomear'}
                                    onChange={this.onChange('sentidoIdentificacao', 'nomear', 'Nomear')}
                                >
                                    Partindo-se da localização da parte define-se o nome ou a informação teórica correta
                                </Option>
                            </List.Item>
                        </List>
                    </Panel>
                </Accordion>
                <Flex style={{ marginTop: 15 }}>
                    {/* <Button onPressOut={() => navigation.goBack()} style={{ flex: 1 }}><Text>Voltar</Text></Button> */}
                    <Button accessibilityLabel={`Iniciar interação do tipo ${accSelected}. Botão. Toque duas vezes para iniciar.`} onPressOut={this.onStart} style={{ flex: 1 }} disabled={!isComplete} type='primary'><Text>Iniciar</Text></Button>
                </Flex>
            </Container>
        )
    }

    onStart = () => {
        const { navigation, screenProps } = this.props;
        const { tipoConteudo, modoAprendizagem, sentidoIdentificacao } = screenProps.modoInteracao;
        const view = getCode(tipoConteudo) + getCode(modoAprendizagem) + getCode(sentidoIdentificacao)
        navigation.navigate(view)
    }

    onChange = (field, value, name) => () => {
        this.props.screenProps.onChangeModoInteracao(field, value)
        announceForAccessibility(`${name} selecionado`)
    }


}

export default Roteiro;