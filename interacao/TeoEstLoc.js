import React, { Component } from 'react';

import { View, Text, TouchableHighlight, TextInput } from 'react-native';
import Container from '../Container';
import List from 'antd-mobile-rn/lib/list';
import Toast from 'antd-mobile-rn/lib/toast';
import Button from 'antd-mobile-rn/lib/button';
import Checkbox from 'antd-mobile-rn/lib/checkbox';

import Modal from 'antd-mobile-rn/lib/modal';
import Card from 'antd-mobile-rn/lib/card';

import { norm } from '../utils'


import { announceForAccessibility, focusOnView } from 'react-native-accessibility';
import Input from '../components/Input'
import Option from '../components/Option'

import BC from '../components/Breadcrumbs'
import Instrucoes from '../components/Instrucoes'

const ListItem = List.Item;


class TeoEstLoc extends Component {
    timer = null;
    fieldRef = []
    localizacao = null;
    initialFocus

    state = {
        loading: true,
        open: false,
        conteudo: undefined,
        conteudos: [],
        filtered: [],
        pecasFisicas: {},
        pesquisa: ''
    }

    componentDidMount() {
        const { anatomp } = this.props.screenProps;

        Toast.loading('Aguarde...', 0)
        announceForAccessibility('Aguarde...')



        // //Seta as partes e seus numeros para cada peça física
        const conteudos = anatomp.roteiro.conteudos.map(c => {
            if (c.plural == '') {
                return { ...c, modo: 'singular', texto: c.singular }
            } else {
                return { ...c, modo: 'plural', texto: c.plural }
            }
        })

        //Objeto de indexação
        let pecasFisicas = {};
        anatomp.pecasFisicas.forEach(pf => {
            pecasFisicas[pf._id] = { ...pf, localizacao: [] };
        })

        //Seta as partes e seus numeros para cada peça física
        anatomp.mapa.forEach(mapa => {
            mapa.localizacao.forEach(loc => {
                pecasFisicas[loc.pecaFisica._id].localizacao.push({ parte: mapa.parte, ...loc })
            })
        })

        this.setState({ loading: false, conteudos, filtered: conteudos, pecasFisicas }, () => {
            Toast.hide();
            focusOnView(this.initialFocus)
        })

    }  

    render() {
        const { navigation, screenProps, isTeoria } = this.props;
        const { open, conteudo, filtered, pecasFisicas } = this.state;

        const selected = conteudo == undefined ? '' : conteudo._id;

        const btnNovoConteudo = this.props.screenProps.config.indexOf('talkback') != -1 ? [{
            text: 'Selecionar outro conteúdo',
            onPress: () => focusOnView(this.initialFocus)
        }] : []        
        return (
            <Container navigation={navigation}>
            <View ref={r => this.initialFocus = r} accessibilityLabel={'Seleção de conteúdo teórico. Prossiga para selecionar um conteúdo.'}>
                <BC body={['Roteiros', screenProps.anatomp.nome]} head={'Estudo-Teórico-Localizar'} />
                </View>
                <Instrucoes
                    info={[
                        'Escolha um conteúdo teórico na lista de conteúdos para visualizar o nome da parte e sua localização nas peças físicas',
                        'Caso deseje, utilize o filtro a seguir para encontrar um conteúdo específico.'
                    ]}
                />
                <Card>
                    <Card.Header title='Conteúdos a selecionar' />
                    <Card.Body>
                    <Input
                            value={this.state.pesquisa}
                            onChange={this.onFilter}
                            name={'Filtro de conteúdo teórico'}
                        />                        
                        <List>
                            {filtered.length > 0 ? filtered.map(c => (
                                <List.Item wrap multipleLine key={c._id} onClick={this.onSelectParte(c)}>
                                    <Text>{c.texto}</Text>
                                </List.Item>
                            )) : <List.Item wrap multipleLine>Nenhum conteúdo foi encontrado</List.Item>}
                        </List>
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
                        ...btnNovoConteudo
                    ]}
                >
                    {conteudo != undefined && <View>
                        <Text style={{textAlign: 'center', fontSize: 18, padding: 5}}>{conteudo.texto}</Text>
                        <List style={{ marginTop: 10 }} ref={r => this.localizacao = r} accessibilityLabel={`COnteúdo ${conteudo.texto} selecionado. Prossiga para ouvir a localização nas peças físicas.`}>
                            {Object.keys(pecasFisicas).map(key => {
                                const pf = pecasFisicas[key];

                                const _Itens = conteudo.partes.map(p => {
                                    const l = pf.localizacao.find(m => m.parte._id == p._id)

                                    if (l) {
                                        return (
                                            <ListItem key={l._id}>
                                                <Text><Text style={{color: '#108ee9'}}>{p.nome}</Text> - Parte {l.numero}</Text>
                                            </ListItem>
                                        )
                                    } else {
                                        return null
                                    }
                                });

                                if (_Itens.find(i => i != null)) {
                                    return _Itens
                                } else {
                                    return null;
                                }
                            })}
                        </List>
                    </View>}
                </Modal>
            </Container>
        )
    }

    onSelectParte = conteudo => e => {
        this.setState({ conteudo, open: true }, () => {
            setTimeout(() => {
                focusOnView(this.localizacao)
            }, 500)
        })
    }

    onOpen = () => this.setState({ open: true })

    onClose = () => this.setState({ open: false })

    onFilter = pesquisa => {
        this.setState({
            pesquisa
        }, () => {
            const _filtered = this.state.conteudos.filter(c => {
                return norm(c.texto).indexOf(norm(pesquisa)) != -1
            });

            const filtered = _filtered != undefined ? _filtered : null

            this.setState({ filtered }, () => {
                // announceForAccessibility(`Na lista ${found.length} partes: ${found.map(f => f.nome).join(', ')}`)
            })
        })
    }
}

export default TeoEstLoc;