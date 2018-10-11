import React, { Component } from 'react';

import { View, Text, TouchableHighlight, TextInput, ScrollView } from 'react-native';
import Container from '../Container';
import List from 'antd-mobile-rn/lib/list';
import Toast from 'antd-mobile-rn/lib/toast';
import Button from 'antd-mobile-rn/lib/button';
import Checkbox from 'antd-mobile-rn/lib/checkbox';
import Modal from 'antd-mobile-rn/lib/modal';
import Card from 'antd-mobile-rn/lib/card';

import { norm } from '../utils'

import BC from '../components/Breadcrumbs'
import Instrucoes from '../components/Instrucoes'

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
        pecasFisicas: {},
        pesquisa: '',
        filtered: this.props.screenProps.anatomp.roteiro.partes
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

    // componentWillUpdate(nextProps, nextState) {
    //     if (JSON.stringify(this.state.parte) != JSON.stringify(nextState.parte)) {
    //         this.setState({ open: true })
    //     }
    // }



    render() {
        const { navigation, screenProps } = this.props;
        const { open, parte, pecasFisicas, filtered } = this.state;

        const selected = parte == undefined ? '' : parte._id;

        const btnNovaParte = this.props.screenProps.config.indexOf('talkback') != -1 ? [{
            text: 'Selecionar nova parte',
            onPress: () => focusOnView(this.initialFocus)
        }] : []

        return (
            <Container navigation={navigation}>
                <View ref={r => this.initialFocus = r} accessibilityLabel={'Seleção de parte anatômica. Prossiga para selecionar uma parte.'}>
                    <BC body={['Roteiros', screenProps.anatomp.nome]} head={'Estudo-Prático-Localizar'} />
                </View>
                <Instrucoes
                    info={[
                        'Escolha uma parte na lista de partes para visualizar sua localização nas peças físicas.',
                        'Caso deseje, utilize o filtro a seguir para encontrar uma parte.'
                    ]}
                />
                <Card>
                    <Card.Header title='Partes a selecionar' />
                    <Card.Body >
                        <Input
                            value={this.state.pesquisa}
                            onChange={this.onFilter}
                            name={'Filtro de partes'}
                        />
                        <List>
                            {filtered.length > 0 ? filtered.map(c => (
                                <List.Item wrap multipleLine key={c._id} onClick={this.onSelectParte(c)}>
                                    <Text>{c.nome}</Text>
                                </List.Item>
                            )) : <List.Item wrap multipleLine>Nenhuma parte encontrada</List.Item>}
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
                        ...btnNovaParte
                    ]}
                >
                    {parte != undefined && <View>
                        <Text style={{ padding: 5, textAlign: 'center', fontSize: 18 }}>{parte.nome}</Text>
                        <List style={{ marginTop: 10 }} ref={r => this.localizacao = r} accessibilityLabel={`Parte ${parte.nome} selecionada. Prossiga para ouvir a localização nas peças físicas.`}>
                            {Object.keys(pecasFisicas).map(key => {
                                const pf = pecasFisicas[key];
                                const l = pf.localizacao.find(m => m.parte._id == parte._id)
                                return l ? (
                                    <ListItem key={l._id}>
                                        <Text><Text style={{ color: '#108ee9' }}>{pf.nome}:</Text>  <Text>Parte {l.numero}</Text></Text>
                                    </ListItem>
                                ) : null;
                            })}
                        </List>
                    </View>}
                </Modal>
            </Container>
        )
    }

    onFilter = pesquisa => {
        this.setState({
            pesquisa
        }, () => {
            const _filtered = this.props.screenProps.anatomp.roteiro.partes.filter(c => {
                return norm(c.nome).indexOf(norm(pesquisa)) != -1
            });

            const filtered = _filtered != undefined ? _filtered : null

            this.setState({ filtered }, () => {
                // announceForAccessibility(`Na lista ${found.length} partes: ${found.map(f => f.nome).join(', ')}`)
            })
        })
    }


    onClose = () => {
        this.setState({
            open: false,
        });
    }

    onSelectParte = parte => e => {
        this.setState({ parte, open: true }, () => {
            setTimeout(() => {
                focusOnView(this.localizacao)
            }, 500)
        })
    }

}

export default PraEstLoc;