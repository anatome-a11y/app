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

const ListItem = List.Item;


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
            <BC _ref={r => this.initialFocus = r} body={['Roteiros', screenProps.anatomp.nome]} head={'Estudo-Teórico-Localizar'} />
                <Instrucoes
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
                        <List ref={r => this.refListaConteudo = r} accessibilityLabel={`Conteúdos teóricos filtrados. Lista com ${filtered.length} itens. Prossiga para ouvir os conteúdos.`}>
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
                    title={conteudo ? conteudo.texto : null}
                    acc={`Informações do conteúdo. Aberto. Prossiga para ouvir o nome da parte e sua localização nas peças físicas.`}
                    footer={[
                        { text: 'Fechar', onPress: this.onClose, acc: `Fechar. Botão. Toque duas vezes para fechar os detalhes do conteúdo ${conteudo ? conteudo.texto : ''}` },
                    ]}
                >
                    {conteudo != undefined && <ScrollView style={{maxHeight: 280}}>
                            {Object.keys(pecasFisicas).map(key => {
                                const pf = pecasFisicas[key];

                                const _Itens = conteudo.partes.map(p => {
                                    const l = pf.localizacao.find(m => m.parte._id == p._id)

                                    if (l) {
                                        if(l.referenciaRelativa.referencia == ''){
                                            return (
                                                <View key={l._id} style={{marginBottom: 8}}>
                                                    <Text><Text style={{fontWeight: 'bold'}}>{p.nome}</Text> - Parte {l.numero} na peça {l.pecaFisica.nome}</Text>
                                                </View>
                                            )
                                        }else{
                                            const referencia = pf.localizacao.find(m => m.parte._id == l.referenciaRelativa.referencia)
                                            return (
                                                <View key={l._id} style={{marginBottom: 8}}>
                                                    <Text><Text style={{fontWeight: 'bold'}}>{p.nome}</Text> - {l.referenciaRelativa.referenciaParaReferenciado} da parte {referencia.numero} ({referencia.parte.nome}) na peça {l.pecaFisica.nome}</Text>
                                                </View>
                                            )                                            
                                        }
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
                    </ScrollView>}
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
                announceForAccessibility(filtered.length > 0 ? `Na lista ${filtered.length} conteúdos. Prossiga para selecionar um destes conteúdos: ${filtered.map(f => f.texto).join(', ')}` : 'Nenhum conteúdo encontrado. Altere as palavras chave e tente novamente.')
            })
        })
    }
}

export default TeoEstLoc;