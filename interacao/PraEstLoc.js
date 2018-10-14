import React, { Component } from 'react';

import { View, Text, TouchableHighlight, TextInput, ScrollView } from 'react-native';
import Container from '../Container';
import List from 'antd-mobile-rn/lib/list';
import Toast from 'antd-mobile-rn/lib/toast';
import Button from 'antd-mobile-rn/lib/button';
import Checkbox from 'antd-mobile-rn/lib/checkbox';

import Card from 'antd-mobile-rn/lib/card';

import { norm } from '../utils'

import BC from '../components/Breadcrumbs'
import Instrucoes from '../components/Instrucoes'

import { announceForAccessibility, focusOnView } from 'react-native-accessibility';
import Input from '../components/Input'
import Modal from '../components/Modal'



const ListItem = List.Item;


class PraEstLoc extends Component {
    initialFocus = null;
    modalBody = null;
    refListaPartes = null;
    refNovaParte = null;

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

        // const btnNovaParte = screenProps.config.indexOf('talkback') != -1 ? [{
        //     text: 'Selecionar nova parte',
        //     acc: `Selecionar nova parte. Botão. Toque duas vezes para selecionar uma nova parte`,
        //     onPress: () => this.setState({open: false}, () => setTimeout(() => {focusOnView(this.refNovaParte)}, 1000)),
        // }] : []

        return (
            <Container navigation={navigation}>
                <BC _ref={r => this.initialFocus = r} body={['Roteiros', screenProps.anatomp.nome]} head={'Estudo-Prático-Localizar'} acc='Prossiga para ouvir as instruções' />
                <Instrucoes
                    info={[
                        'Escolha uma parte na lista de partes para visualizar sua localização nas peças físicas.',
                        'Caso deseje, utilize o filtro a seguir para encontrar uma parte.'
                    ]}
                />
                <Card>
                    <Card.Header ref={r => this.refNovaParte = r} title='Partes a selecionar' accessibilityLabel='Partes a selecionar. A seguir informe uma parte para filtrar a lista de partes' />
                    <Card.Body >
                        <Input
                            value={this.state.pesquisa}
                            onChange={this.onFilter}
                            name={'Filtro de partes'}                            
                        />
                        <List accessibilityLabel='Lista de partes filtradas. Prossiga para ouvir os nomes das partes.' ref={r => this.refListaPartes = r}>
                            {filtered.length > 0 ? filtered.map(c => (
                                <List.Item accessible accessibilityLabel={`${c.nome}. Botão. Toque duas vezes para abrir.`} wrap multipleLine key={c._id} onClick={this.onSelectParte(c)}>
                                    <Text>{c.nome}</Text>
                                </List.Item>
                            )) : <List.Item accessibilityLabel='Nenhuma parte encontrada. Altere as palavras chave do campo de busca.' wrap multipleLine>Nenhuma parte encontrada</List.Item>}
                        </List>
                    </Card.Body>
                </Card>
                <Modal
                    talkback={screenProps.config.indexOf('talkback') != -1}
                    open={open}
                    title={parte ? parte.nome : null}
                    acc={`Detalhes da Parte ${parte ? parte.nome : ''}. Aberto. Prossiga para ouvir a localização nas peças físicas.`}
                    footer={[
                        { text: 'Fechar', onPress: this.onClose, acc: `Fechar. Botão. Toque duas vezes para fechar os detalhes da Parte ${parte ? parte.nome : ''}` },
                    ]}
                >
                    {parte != undefined ? <View>
                        <List style={{ marginTop: 10 }} >
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
                    </View> : null}
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
                announceForAccessibility(`Na lista ${filtered.length} partes: ${filtered.map(f => f.nome).join(', ')}. Prossiga para selecionar.`)
            })
        })
    }


    onClose = () => {
        this.setState({
            open: false,
        });
    }

    onSelectParte = parte => e => {
        this.setState({ parte, open: true })
    }

}

export default PraEstLoc;