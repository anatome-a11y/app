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


class PraEstLoc extends Component {
    timer = null;
    fieldRef = []

    state = {
        loading: true,
        open: false,
        parte: undefined,
        pecasFisicas: {}
    }

    componentDidMount() {
        const { anatomp } = this.props.screenProps;

        Toast.loading('Aguarde...', 0)
        announceForAccessibility('Aguarde...')

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

        this.setState({ loading: false, pecasFisicas }, () => {
            Toast.hide();
        })

    }

    render() {
        const { navigation, screenProps, isTeoria } = this.props;
        const { open, parte, pecasFisicas } = this.state;

        const selected = parte == undefined ? '' : parte._id;
        return (
            <Container navigation={navigation}>
                <List renderHeader={() => 'Parte anatômica'}>
                    <ListItem>
                        <Button onPressOut={this.onOpen}>Selecionar</Button>
                    </ListItem>
                    <ListItem>
                        {parte != undefined ? <Text>Parte: {parte.nome}</Text> : <Text>Nenhuma parte selecionada</Text>}
                    </ListItem>
                </List>
                {parte != undefined && <View>
                    <Text>Localização</Text>
                    {Object.keys(pecasFisicas).map(key => {
                        const pf = pecasFisicas[key];
                        const l = pf.localizacao.find(m => m.parte._id == parte._id)
                        const _Item = l ? (
                            <ListItem key={l._id}>
                                <Text> Número {l.numero}</Text>
                            </ListItem>
                        ) : null;

                        if (_Item != null) {
                            return (<List renderHeader={() => pf.nome}>{_Item}</List>)
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
                    <List renderHeader={() => 'Partes anatômicas'}>
                        {screenProps.anatomp.roteiro.partes.map(c => (
                            <List.Item wrap multipleLine key={c._id}>
                                <Checkbox checked={c._id == selected} onChange={this.onSelectParte(c)} >
                                    <View style={{ marginLeft: 15 }} >
                                        <Text>{c.nome}</Text>
                                    </View>
                                </Checkbox>
                            </List.Item>
                        ))}
                    </List>
                </Modal>
            </Container>
        )
    }

    onSelectParte = parte => e => this.setState({ parte, open: false })

    onOpen = () => this.setState({ open: true })

    onClose = () => this.setState({ open: false })
}

export default PraEstLoc;