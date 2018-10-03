import React, { Component } from 'react';

import { View, Text, TouchableHighlight, TextInput, Modal, ScrollView } from 'react-native';
import Container from '../Container';
import List from 'antd-mobile-rn/lib/list';
import Toast from 'antd-mobile-rn/lib/toast';
import Button from 'antd-mobile-rn/lib/button';
import Checkbox from 'antd-mobile-rn/lib/checkbox';

import BC from '../components/Breadcrumbs'

import { announceForAccessibility, focusOnView } from 'react-native-accessibility';
import Input from '../components/Input'
import Option from '../components/Option'


const ListItem = List.Item;


class PraEstLoc extends Component {
    initialFocus = null;
    modalBody = null;
    localizacao = null;

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
            setTimeout(() => {
                Toast.hide();
                focusOnView(this.initialFocus)
            }, 500)
        })

    }

    render() {
        const { navigation, screenProps, isTeoria } = this.props;
        const { open, parte, pecasFisicas } = this.state;

        const selected = parte == undefined ? '' : parte._id;
        return (
            <Container navigation={navigation}>
                <ScrollView style={{flexGrow: 0}}>
                    <View ref={r => this.initialFocus = r} accessibilityLabel={'Seleção de parte anatômica. Prossiga para selecionar uma parte.'}>
                        <BC body={['Roteiros', screenProps.anatomp.nome]} head={'Estudo-Prático-Localizar'} />
                    </View>
                    <List renderHeader={() => 'Parte anatômica'}>
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
                </ScrollView>
                {parte != undefined && <View>
                    <List ref={r => this.localizacao = r} accessibilityLabel={`Parte ${parte.nome} selecionada. Prossiga para ouvir a localização nas peças físicas.`} renderHeader={() => 'Localização da parte nas peças'}>
                        {Object.keys(pecasFisicas).map(key => {
                            const pf = pecasFisicas[key];
                            const l = pf.localizacao.find(m => m.parte._id == parte._id)
                            return l ? (
                                <ListItem key={l._id}>
                                    <Text>{pf.nome}:  Número {l.numero}</Text>
                                </ListItem>
                            ) : null;
                        })}
                        {this.props.screenProps.config.indexOf('talkback') != -1 && (
                            <ListItem style={{textAlign: 'center'}}>
                                <Button accessibilityLabel='Selecionar nova parte. Botão. Toque duas vezes para voltar para a seleção de partes'  onPressOut={() => focusOnView(this.initialFocus)} >Selecionar nova parte</Button>
                            </ListItem>                            
                        )}
                    </List>
                </View>}
            </Container>
        )
    }

    onSelectParte = parte => e => {
        this.setState({ parte }, () => {
            setTimeout(() => {
                focusOnView(this.localizacao)  
            }, 500)          
        })
    }

}

export default PraEstLoc;