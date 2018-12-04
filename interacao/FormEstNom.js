import React, { Component } from 'react';

import { View, Text, TouchableHighlight, ScrollView } from 'react-native';
import Container from '../Container';
import List from 'antd-mobile-rn/lib/list';
import Toast from 'antd-mobile-rn/lib/toast';

import { announceForAccessibility, focusOnView } from 'react-native-accessibility';
import Input from '../components/Input'
import { Simple as Option } from '../components/Option'

import Card from 'antd-mobile-rn/lib/card';
import Button from 'antd-mobile-rn/lib/button';


import Imagens from '../components/Imagens'
import Videos from '../components/Videos'

import BC from '../components/Breadcrumbs'
import Instrucoes from '../components/Instrucoes'
import Modal from '../components/Modal'

const ListItem = List.Item;


class FormEstNom extends Component {
    fieldRef = []
    initialFocus = null;
    refBtnDetalhes = null;
    headerParte = null;

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
            mapa.localizacao.map(loc => pecasFisicas[loc.pecaFisica._id].partesNumeradas.push({ parte: mapa.parte, numero: loc.numero, referenciaRelativa: loc.referenciaRelativa }));
        })

        this.setState({ loading: false, pecasFisicas, pecaFisica: Object.keys(pecasFisicas)[0] }, () => {
            setTimeout(() => {
                Toast.hide();
                focusOnView(this.initialFocus)
            }, 500)
        })

    }

    render() {
        const { navigation, screenProps, isTeoria, interaction } = this.props;
        const { value, pecasFisicas, pecaFisica, parte, conteudos, open } = this.state;

        // const btnNovoFluxo = this.props.screenProps.config.indexOf('talkback') != -1 ? [{
        //     text: 'Nova seleção',
        //     onPress: () => focusOnView(this.initialFocus)
        // }] : []

        const view = isTeoria ? 'nome e os conteúdos associados.' : 'nome.';

        return (
            <Container navigation={navigation}>
                <BC _ref={r => this.initialFocus = r} body={['Roteiros', screenProps.anatomp.nome]} head={interaction} />
                <Instrucoes
                    voz={screenProps.config.indexOf('voz') != -1}
                    info={[
                        'Selecione uma peça física e indique a localização de uma parte para obter seu ' + view,
                    ]}
                />
                <Card style={{ marginBottom: 10 }}>
                    <Card.Header title='Peças físicas' accessibilityLabel='Peças físicas. Prossiga para selecionar uma peça física.' />
                    <Card.Body>
                        <List>
                            {
                                Object.keys(pecasFisicas).map(key => {
                                    const pf = pecasFisicas[key];
                                    return (
                                        <ListItem key={pf._id}>
                                            <Option
                                                checked={pecaFisica == pf._id}
                                                onChange={this.onSelectPF(pf)}
                                                label={pf.nome}
                                            />
                                        </ListItem>
                                    )
                                })
                            }
                        </List>
                    </Card.Body>
                </Card>

                <Card style={{ marginBottom: 10 }}>
                    <Card.Header ref={r => this.headerParte = r} title='Parte anatômica' accessibilityLabel='Parte anatômica. A seguir informe a localização de uma parte para obter suas informações' />
                    <Card.Body>
                        <Input
                            isTag
                            _ref={this.onGetRef}
                            value={value}
                            onSkipAlternatives={() => {
                                if (this.props.isTeoria) {
                                    focusOnView(this.refBtnDetalhes)
                                } else {
                                    focusOnView(this.fieldRef)
                                }
                            }}
                            onChange={this.onChange}
                            name='Localização da parte'
                            onDone={this.onOpen}
                            InputProps={{
                                type: 'number',
                                error: parte == undefined && value != '',
                                onErrorClick: this.onErrorClick,
                            }}
                        />
                        {<Button ref={r => this.refBtnDetalhes = r} accessibilityLabel='Partes referenciadas. Botão. Toque duas vezes para ouvir as partes referenciadas ou volte para informar uma nova parte' style={{ margin: 5 }} disabled={(!parte && !value) || !pecaFisica} onPressOut={this.onOpen} type='primary'>Informações da parte</Button>}
                        {/* {(this.props.isTeoria && screenProps.config.indexOf('talkback') == -1) && <Button ref={r => this.refBtnDetalhes = r} accessibilityLabel='Nome da parte. Botão. Toque duas vezes para obter o nome da parte' style={{margin: 5}} disabled={(!parte && !value) || !pecaFisica} onPressOut={this.onOpen} type='primary'>Nome da parte</Button>} */}
                        {/* {screenProps.config.indexOf('talkback') != -1 && <Button type='primary' onPressOut={() => focusOnView(this.fieldRef)}>Voltar para o filtro</Button>} */}
                    </Card.Body>
                </Card>

                <Modal
                    talkback={screenProps.config.indexOf('talkback') != -1}
                    open={open}
                    title={parte ? parte.parte.nome : null}
                    acc={`Parte ${parte ? parte.parte.nome : ''}. Aberto. Prossiga para ouvir as partes referenciadas`}
                    footer={[
                        { text: 'Fechar', onPress: this.onClose, acc: `Fechar. Botão. Toque duas vezes para fechar` },
                    ]}
                >
                    {parte != undefined ? <ScrollView style={{ maxHeight: 280 }}>
                        {
                            conteudos.length > 0 && (conteudos.map(c => (
                                <View key={c.texto} style={{ marginBottom: 8 }}>
                                    <Text style={{textAlign: 'justify'}}>{c.texto}</Text>
                                    {isTeoria && (
                                        <View>
                                            <Imagens config={screenProps.config} midias={c.midias} />
                                            <Videos config={screenProps.config} midias={c.midias} />
                                        </View>
                                    )}
                                </View>
                            )))
                        }
                    </ScrollView> : <Text style={{ padding: 5, textAlign: 'center' }}>Parte não setada nesta peça física</Text>}
                </Modal>
            </Container>
        )
    }

    onOpen = () => this.setState({ open: true })

    onClose = () => this.setState({ open: false })

    onErrorClick = () => { Toast.info('Parte não registrada'); announceForAccessibility('Parte não registrada') }



    onChange = value => {
        const { pecasFisicas, pecaFisica } = this.state;
        const parte = pecasFisicas[pecaFisica].partesNumeradas.find(p => p.numero == value);
        let conteudos = [];
        if (parte != undefined) {

            if (this.props.isTeoria) {
                announceForAccessibility(parte.parte.nome + '. Prossiga para ouvir os conteúdos associados')
                conteudos = this.props.screenProps.anatomp.roteiro.conteudos.filter(c => c.partes.find(p => p._id == parte.parte._id)).map(c => ({texto: c.singular, midias: c.midias}));
            } else {
                const referenciaAsPartes = pecasFisicas[pecaFisica].partesNumeradas.filter(m => m.referenciaRelativa.referencia == parte.parte._id)
                const localizacaoRelativa = referenciaAsPartes.map(r => ({texto: ' Referencia a parte ' + r.numero + ': ' + r.parte.nome + '. ' + r.referenciaRelativa.referenciadoParaReferencia}));
                if (localizacaoRelativa.length > 0) {
                    conteudos = localizacaoRelativa;
                    announceForAccessibility(parte.parte.nome + '. Prossiga para ouvir as partes referenciadas')
                } else {
                    announceForAccessibility(parte.parte.nome)
                }
            }
        } else {
            announceForAccessibility('Parte não setada nesta peça física')
        }
        this.setState({ value, parte, conteudos })
    }

    onSelectPF = pecaFisica => e => {
        this.setState({ pecaFisica: pecaFisica._id, parte: undefined, value: '' })
        announceForAccessibility(`${pecaFisica.nome} selecionado.`)
        setTimeout(() => {
            focusOnView(this.headerParte)
        }, 2000)

    }

    onGetRef = r => { this.fieldRef = r }
}

export default FormEstNom;