import Badge from 'antd-mobile-rn/lib/badge';
import Button from 'antd-mobile-rn/lib/button';
import Card from 'antd-mobile-rn/lib/card';
import List from 'antd-mobile-rn/lib/list';
import Toast from 'antd-mobile-rn/lib/toast';
import React, { Component } from 'react';
import { Dimensions, Image, ScrollView, Text, View } from 'react-native';
import { announceForAccessibility, focusOnView } from 'react-native-accessibility';
import BC from '../components/Breadcrumbs';
import Imagens from '../components/Imagens';
import Input from '../components/Input';
import Instrucoes from '../components/Instrucoes';
import Modal from '../components/Modal';
import ReferenciasRelativas from '../components/ReferenciasRelativas';
import Videos from '../components/Videos';
import Container from '../Container';
import { norm } from '../utils';


const ListItem = List.Item;

const windowWidth = Dimensions.get('window').width;


const LocalizacaoPF = ({ conteudo, pecasFisicas }) => {

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


const LocalizacaoPD = ({ conteudo, pecasFisicas = [], exibirLabel = true, mapa }) => {

    let pecasFisicasFiltradas = [];

    let conteudoFiltrado = JSON.parse(JSON.stringify(conteudo));
    // Filtra as partes referenciadas
    conteudo.partes.map(parte => {
        const mapaParte = mapa.find(m => m.parte._id == parte._id)

        // Caso seja uma parte referenciada
        if (mapaParte && mapaParte.localizacao[0].referenciaRelativa.referencia != null) {
            conteudoFiltrado.partes.push(mapaParte.localizacao[0].referenciaRelativa.referencia)
        }
    })

    Object.keys(pecasFisicas).map(key => {

        let peca = JSON.parse(JSON.stringify(pecasFisicas[key]));

        let pecaFiltrada = JSON.parse(JSON.stringify(pecasFisicas[key]));
        pecaFiltrada.midias = [];
        pecaFiltrada.localizacao = [];

        let pontos = [];
        for (let image of peca.midias) {
            let imageFiltrada = JSON.parse(JSON.stringify(image));
            imageFiltrada.pontos = [];

            conteudoFiltrado.partes.map(cParte => {
                imageFiltrada.pontos = image.pontos.filter(ponto => ponto.parte._id == cParte._id);
                if (imageFiltrada && imageFiltrada.pontos && imageFiltrada.pontos.length > 0) {
                    pontos = pontos.concat(imageFiltrada.pontos);
                }
            })
            imageFiltrada.pontos = pontos;
            if (imageFiltrada && imageFiltrada.pontos && imageFiltrada.pontos.length > 0) {
                pecaFiltrada.midias.push(imageFiltrada);
            }
            pontos = [];
        }
        if (pecaFiltrada.midias && pecaFiltrada.midias.length > 0) {
            pecasFisicasFiltradas.push(pecaFiltrada);
        }

    });

    pecasFisicasFiltradas = pecasFisicasFiltradas.filter(p => p.midias.length > 0);

    return pecasFisicasFiltradas.map(peca => peca.midias.map((image, idx) =>
        <View>
            <Image
                style={{
                    width: windowWidth - 30,
                    height: windowWidth - 30,
                    resizeMode: 'stretch',
                    position: 'relative',
                }}
                source={{ uri: image.url }}
            />
            {image.pontos.map((point, idxPonto) =>
                <Badge
                    text={exibirLabel ? point.label : "  "}
                    style={{ top: point.y + "%", left: point.x + "%", position: 'absolute' }}>
                </Badge>
            )}
            {image.vista &&
                <Text style={{ marginBottom: 8 }}>
                    <Text style={{ fontSize: 10, fontWeight: 'bold' }}>Vista: </Text>{"\n"}
                    <Text style={{ fontSize: 10 }}>{image.vista}</Text>
                </Text>
            }
            {image.referencia &&
                <Text style={{ marginBottom: 8 }}>
                    <Text style={{ fontSize: 10, fontWeight: 'bold' }}>Referência: </Text>{"\n"}
                    <Text style={{ fontSize: 10 }}>{image.referencia}</Text>
                </Text>
            }
        </View>
    ))
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
        openDigital: false,
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
        const { open, openDigital, conteudo, filtered, pecasFisicas } = this.state;

        const selected = conteudo == undefined ? '' : conteudo._id;

        const modalTitle = (conteudo && conteudo.partes) ? (conteudo.partes.length == 1 ? conteudo.partes[0].nome : `Partes: ${conteudo.partes.map(item => item.nome).join(', ')}`) : null

        const info = (screenProps.anatomp.tipoPecaMapeamento == 'pecaFisica' ? 'Escolha um conteúdo teórico na lista de conteúdos para obter o nome da parte e sua localização nas peças físicas.' : 'Escolha um conteúdo teórico na lista de conteúdos para obter o nome da parte e sua localização nas peças digitais.');

        return (
            <Container navigation={navigation}>
                <BC _ref={r => this.initialFocus = r} body={['Roteiros', screenProps.anatomp.nome]} head={'Estudo - Teórico - Conteúdo-Localização'} />
                <Instrucoes
                    voz={screenProps.config.indexOf('voz') != -1}
                    info={[
                        info,
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


                {/* Modal Peças Físicas */}
                <Modal
                    talkback={screenProps.config.indexOf('talkback') != -1}
                    open={open}
                    // title={null}
                    title={modalTitle}
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

                {/* Modal Peças Digitais */}
                <Modal
                    talkback={true}
                    open={openDigital}
                    title={modalTitle}
                    acc={`Aberto. Prossiga para ouvir o nome da parte e sua localização nas peças digitais.`}
                    footer={[
                        { text: 'Fechar', onPress: this.onCloseDigital, acc: `Fechar. Botão. Toque duas vezes para fechar os detalhes do conteúdo ${conteudo ? conteudo.texto : ''}` },
                    ]}
                >
                    <ScrollView style={{ maxHeight: '87%', padding: 5 }}>
                        {conteudo && conteudo.partes.map(p => <ReferenciasRelativas attrName='localizacao' key={p._id} parte={p} pecasFisicas={pecasFisicas} />)}
                        <LocalizacaoPD conteudo={conteudo} pecasFisicas={pecasFisicas} exibirLabel={true} mapa={screenProps.anatomp.mapa} />
                    </ScrollView>
                </Modal>
            </Container>
        )
    }

    onSelectParte = conteudo => e => {
        if (this.props.screenProps.anatomp.tipoPecaMapeamento == 'pecaFisica') {
            this.setState({ conteudo, open: true })
        } else if (this.props.screenProps.anatomp.tipoPecaMapeamento == 'pecaDigital') {
            this.setState({ conteudo, openDigital: true })
        }
    }

    onOpen = () => this.setState({ open: true })

    onClose = () => this.setState({ open: false })

    onOpenDigital = () => this.setState({ openDigital: true })

    onCloseDigital = () => this.setState({ openDigital: false })

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