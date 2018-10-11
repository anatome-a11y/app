import React, { Component } from 'react';

import { View, Text, TouchableHighlight, TextInput } from 'react-native';
import Container from '../Container';
import List from 'antd-mobile-rn/lib/list';
import Toast from 'antd-mobile-rn/lib/toast';

import { announceForAccessibility, focusOnView } from 'react-native-accessibility';
import Input from '../components/Input'
import Option from '../components/Option'

import Modal from 'antd-mobile-rn/lib/modal';
import Card from 'antd-mobile-rn/lib/card';
import Button from 'antd-mobile-rn/lib/button';


const ListItem = List.Item;

import BC from '../components/Breadcrumbs'
import Instrucoes from '../components/Instrucoes'


class FormEstNom extends Component {
    fieldRef = []
    initialFocus = null;

    state = {
        pecasFisicas: {},
        pecaFisica: '',
        loading: true,
        parte: undefined,
        value: '',
        conteudos: []
    }

    componentDidMount() {
        const { anatomp } = this.props.screenProps;

        Toast.loading('Aguarde...', 0)
        announceForAccessibility('Aguarde...')

        //Objeto de indexação
        let pecasFisicas = {};
        anatomp.pecasFisicas.forEach(pf => {
            pecasFisicas[pf._id] = { ...pf, partesNumeradas: [] };
        })

        //Seta as partes e seus numeros para cada peça física
        anatomp.mapa.forEach(mapa => {
            mapa.localizacao.map(loc => pecasFisicas[loc.pecaFisica._id].partesNumeradas.push({ parte: mapa.parte, numero: loc.numero }));
        })

        this.setState({ loading: false, pecasFisicas, pecaFisica: Object.keys(pecasFisicas)[0] }, () => {
            Toast.hide();
        })

    }

    render() {
        const { navigation, screenProps, isTeoria, interaction } = this.props;
        const { value, pecasFisicas, pecaFisica, parte, conteudos, open } = this.state;

        const btnNovoFluxo = this.props.screenProps.config.indexOf('talkback') != -1 ? [{
            text: 'Nova seleção',
            onPress: () => focusOnView(this.initialFocus)
        }] : []

        const view = isTeoria ? 'nome e os conteúdos associados.' : 'nome.';

        return (
            <Container navigation={navigation}>
                    <BC body={['Roteiros', screenProps.anatomp.nome]} head={interaction} />
                <Instrucoes
                    info={[
                        'Selecione uma peça física e informe uma parte para visualizar seu '+view,
                    ]}
                />
                <Card ref={r => this.initialFocus = r} style={{ marginBottom: 10 }}>
                    <Card.Header title='Peças físicas' />
                    <Card.Body>
                        <List>
                            {
                                Object.keys(pecasFisicas).map(key => {
                                    const pf = pecasFisicas[key];
                                    return (
                                        <ListItem key={pf._id}>
                                            <Option
                                                checked={pecaFisica == pf._id}
                                                onChange={this.onSelectPF(pf._id)}
                                            >
                                                {pf.nome}
                                            </Option>
                                        </ListItem>
                                    )
                                })
                            }
                        </List>
                    </Card.Body>
                </Card>

                <Card style={{ marginBottom: 10 }}>
                    <Card.Header title='Parte anatômica' />
                    <Card.Body>
                        <Input
                            isTag
                            _ref={this.onGetRef}
                            value={value}
                            onChange={this.onChange}
                            name='Localização'
                            onDone={this.onOpen}
                            InputProps={{
                                type: 'number',
                                error: parte == undefined && value != '',
                                onErrorClick: this.onErrorClick,
                            }}
                        />
                        <Button style={{margin: 5}} disabled={(!parte && !value) || !pecaFisica} onPressOut={this.onOpen} type='primary'>Pesquisar</Button>
                    </Card.Body>
                </Card>

                <Modal
                    title={null}
                    transparent
                    onClose={this.onClose}
                    maskClosable
                    visible={open}
                    closable={false}
                    footer={[
                        { text: 'Fechar', onPress: this.onClose },
                        ...btnNovoFluxo
                    ]}
                >
                    {parte != undefined ? <View>
                        <Text style={{ textAlign: 'center', padding: 5, fontSize: 18 }}>{parte.parte.nome}</Text>
                        {isTeoria && <List>
                            {
                                conteudos.length == 0 ? (
                                    <ListItem key='emptyList'>
                                        <Text>Nenhum conteúdo foi encontrado</Text>
                                    </ListItem>
                                ) : (conteudos.map(c => (
                                    <ListItem key={c}>
                                        <Text>{c}</Text>
                                    </ListItem>
                                )))
                            }
                        </List>}
                    </View> : <Text style={{padding: 5, textAlign: 'center'}}>Parte não encontrada</Text>}
                </Modal>
            </Container>
        )
    }

    onOpen = () => this.setState({open: true})

    onClose = () => this.setState({open: false})

    onErrorClick = () => { Toast.info('Parte não registrada'); announceForAccessibility('Parte não registrada') }



    onChange = value => {
        const { pecasFisicas, pecaFisica } = this.state;
        const parte = pecasFisicas[pecaFisica].partesNumeradas.find(p => p.numero == value);
        const conteudos = (parte == undefined || !this.props.isTeoria) ? [] : this.props.screenProps.anatomp.roteiro.conteudos.filter(c => c.partes.find(p => p._id == parte.parte._id)).map(c => c.singular)
        this.setState({ value, parte, conteudos })
    }

    onSelectPF = pecaFisica => e => this.setState({ pecaFisica, parte: undefined, value: '' })

    onGetRef = r => { this.fieldRef = r }
}

export default FormEstNom;