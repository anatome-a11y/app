import React, { Component } from 'react';

import { ScrollView, View, Text, TouchableHighlight, TextInput } from 'react-native';
import Container from '../Container';
import List from 'antd-mobile-rn/lib/list';
import Toast from 'antd-mobile-rn/lib/toast';
import Button from 'antd-mobile-rn/lib/button';
import Checkbox from 'antd-mobile-rn/lib/checkbox';
import Card from 'antd-mobile-rn/lib/card';

import { norm } from '../utils'


import { announceForAccessibility, focusOnView } from 'react-native-accessibility';
import Input from '../components/Input'
import Option from '../components/Option'
import Modal from '../components/Modal'

import Imagens from '../components/Imagens'
import Videos from '../components/Videos'
import BC from '../components/Breadcrumbs'
import Instrucoes from '../components/Instrucoes'
import ReferenciasRelativas from '../components/ReferenciasRelativas';

const ListItem = List.Item;



const LocalizacaoPF = ({conteudo, pecasFisicas}) => {
    if (conteudo != undefined) {
        return Object.keys(pecasFisicas).map(key => conteudo.partes.map(p => {
            const localizacao = pf = pecasFisicas[key].localizacao.find(m => m.parte._id == p._id)

            if (localizacao && localizacao.referenciaRelativa.referencia == null) {
                return (
                    <View key={localizacao._id} style={{ marginBottom: 8 }}>
                        <Text><Text style={{ fontWeight: 'bold' }}>{p.nome}</Text> - Parte {localizacao.numero} na peça {localizacao.pecaFisica.nome}</Text>
                    </View>
                )
            } else {
                return null
            }
        }))
    } else {
        return null
    }
}


class TeoEstLoc extends Component {
    timer = null;
    fieldRef = [];
    inputRef = null;
    localizacao = null;
    initialFocus = null;
    refListaConteudo = null;

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
            setTimeout(() => {
                Toast.hide();
                focusOnView(this.initialFocus)
            }, 500)
        })

    }

    render() {
        const { navigation, screenProps, isTeoria } = this.props;
        const { open, conteudo, filtered, pecasFisicas } = this.state;

        const selected = conteudo == undefined ? '' : conteudo._id;

        return (
            <Container navigation={navigation}>
                <BC _ref={r => this.initialFocus = r} body={['Roteiros', screenProps.anatomp.nome]} head={'Estudo - Teórico - Conteúdo-Localização'} />
                <Instrucoes
                    voz={screenProps.config.indexOf('voz') != -1}
                    info={[
                        'Escolha um conteúdo teórico na lista de conteúdos para obter o nome da parte e sua localização nas peças físicas',
                        'Caso deseje, utilize o filtro a seguir para encontrar um conteúdo específico.'
                    ]}
                />
                <Card>
                    <Card.Header title='Conteúdos a selecionar' accessibilityLabel='Conteúdos a selecionar. A seguir informe uma parte para filtrar a lista de partes' />
                    <Card.Body>
                        <Input
                            _ref={r => this.inputRef = r}
                            value={this.state.pesquisa}
                            onChange={this.onFilter}
                            name={'Filtro de conteúdo teórico'}
                            onSkipAlternatives={() => focusOnView(this.refListaConteudo)}
                        />
                        <List renderHeader={() => `Lista de conteúdos teóricos`} ref={r => this.refListaConteudo = r} accessibilityLabel={`Conteúdos teóricos filtrados. Lista com ${filtered.length} itens. Prossiga para ouvir os conteúdos.`}>
                            {filtered.length > 0 ? filtered.map(c => (
                                <List.Item accessible accessibilityLabel={`${c.texto}. Botão. Toque duas vezes para abrir ou prossiga para obter mais opções.`} wrap multipleLine key={c._id} onClick={this.onSelectParte(c)}>
                                    <Text>{c.texto}</Text>
                                    <Imagens config={screenProps.config} midias={c.midias} />
                                    <Videos config={screenProps.config} midias={c.midias} />
                                </List.Item>
                            )) : <List.Item accessibilityLabel='Nenhuma parte encontrada. Altere as palavras chave do campo de busca.' wrap multipleLine>Nenhum conteúdo foi encontrado</List.Item>}
                        </List>
                        {screenProps.config.indexOf('talkback') != -1 && <Button type='primary' onPressOut={() => focusOnView(this.inputRef)}>Voltar para o filtro</Button>}
                    </Card.Body>
                </Card>
                <Modal
                    talkback={screenProps.config.indexOf('talkback') != -1}
                    open={open}
                    // title={null}
                    title={null}
                    acc={`Aberto. Prossiga para ouvir o nome da parte e sua localização nas peças físicas.`}
                    footer={[
                        { text: 'Fechar', onPress: this.onClose, acc: `Fechar. Botão. Toque duas vezes para fechar os detalhes do conteúdo ${conteudo ? conteudo.texto : ''}` },
                    ]}
                >
                    <ScrollView style={{ maxHeight: 280 }}>
                        <LocalizacaoPF conteudo={conteudo} pecasFisicas={pecasFisicas} />
                        {conteudo && conteudo.partes.map(p => <ReferenciasRelativas attrName='localizacao' key={p._id} parte={p} pecasFisicas={pecasFisicas} />)}
                    </ScrollView>
                </Modal>
            </Container>
        )
    }

    onSelectParte = conteudo => e => {
        this.setState({ conteudo, open: true })
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
                if (filtered.length > 0) {
                    const naLista = `Na lista ${filtered.length} conteúdos. Prossiga para selecionar.`;
                    if (pesquisa) {
                        announceForAccessibility(`Texto detectado: ${pesquisa}. ${naLista}`)
                    } else {
                        announceForAccessibility(`Texto removido. ${naLista}`)
                    }
                } else {
                    announceForAccessibility(`Nenhum conteúdo foi encontrado para o filtro ${pesquisa}`)
                }
            })
        })
    }
}

export default TeoEstLoc;