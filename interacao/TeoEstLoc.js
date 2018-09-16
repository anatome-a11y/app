import React, { Component } from 'react';

import { View, Text, TouchableHighlight, TextInput, Modal } from 'react-native';
import Container from '../Container';
import List from 'antd-mobile-rn/lib/list';
import Toast from 'antd-mobile-rn/lib/toast';
import Button from 'antd-mobile-rn/lib/button';
import Checkbox from 'antd-mobile-rn/lib/checkbox';


import { announceForAccessibility, focusOnView } from 'react-native-accessibility';
import Input from '../components/Input'
import Option from '../components/Option'


const ListItem = List.Item;


class TeoEstLoc extends Component {
    timer = null;
    fieldRef = []

    state = {
        loading: true,
        open: false,
        conteudo: undefined,
        conteudos: [],
        pecasFisicas: {}
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

        this.setState({ loading: false, conteudos, pecasFisicas }, () => {
            Toast.hide();
        })

    }

    render() {
        const { navigation, screenProps, isTeoria } = this.props;
        const { open, conteudo, conteudos, pecasFisicas } = this.state;

        const selected = conteudo == undefined ? '' : conteudo._id;
        return (
            <Container navigation={navigation}>
                <List renderHeader={() => 'Conteúdo teórico'}>
                    <ListItem>
                        <Button onPressOut={this.onOpen}>Selecionar conteúdo</Button>
                    </ListItem>
                    <ListItem>
                        {conteudo != undefined ? <Text>Conteúdo: {conteudo.texto}</Text> : <Text>Nenhum conteúdo selecionado</Text>}
                    </ListItem>
                </List>
                {conteudo != undefined && <View>
                    <Text>Localização</Text>
                    {Object.keys(pecasFisicas).map(key => {
                        const pf = pecasFisicas[key];

                        const _Itens = conteudo.partes.map(p => {
                            const l = pf.localizacao.find(m => m.parte._id == p._id)
                            
                            if (l) {
                                return (
                                    <ListItem key={l._id}>
                                        <Text>{p.nome} - Número {l.numero}</Text>
                                    </ListItem>
                                )
                            } else {
                                return null
                            }
                        });

                        if (_Itens.find(i => i != null)) {
                            return (<List renderHeader={() => pf.nome}>{_Itens}</List>)
                        } else {
                            return null;
                        }
                    })}
                </View>}
                <Modal
                    animationType="slide"
                    transparent={false}
                    visible={open}
                    onRequestClose={this.onClose}>
                    <List renderHeader={() => 'Conteúdos teóricos'}>
                        {conteudos.map(c => (
                            <List.Item wrap multipleLine key={c._id}>
                                <Checkbox checked={c._id == selected} onChange={this.onSelectCT(c)} >
                                    <View style={{ marginLeft: 15 }} >
                                        <Text>{c.texto}</Text>
                                    </View>
                                </Checkbox>
                            </List.Item>
                        ))}
                    </List>
                </Modal>
            </Container>
        )
    }

    onSelectCT = conteudo => e => this.setState({ conteudo, open: false })

    onOpen = () => this.setState({ open: true })

    onClose = () => this.setState({ open: false })
}

export default TeoEstLoc;