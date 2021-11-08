import Badge from 'antd-mobile-rn/lib/badge';
import Button from 'antd-mobile-rn/lib/button';
import Card from 'antd-mobile-rn/lib/card';
import Icon from 'antd-mobile-rn/lib/icon';
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
import { Simple as Option } from '../components/Option';
import ReferenciasRelativas from '../components/ReferenciasRelativas';
import Videos from '../components/Videos';
import Container from '../Container';
import { withI18n } from '../messages/withI18n';


const ListItem = List.Item;
const windowWidth = Dimensions.get('window').width;

const ModalBody = ({ conteudos, config }) => {
    return conteudos.length > 0 && (conteudos.map(c => (
        <View key={c.texto} style={{ marginBottom: 8 }}>
            <Text style={{ textAlign: 'justify' }}>{c.texto}</Text>
            <View>
                <Imagens config={config} midias={c.midias} />
                <Videos config={config} midias={c.midias} />
            </View>
        </View>
    )))
}


class FormEstNom extends Component {
    fieldRef = []
    initialFocus = null;
    refBtnDetalhes = null;

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
        const { navigation, screenProps, isTeoria, interaction, i18n } = this.props;
        const { value, pecasFisicas, pecaFisica, parte, conteudos, open, openImageInformation, imageInformation } = this.state;

        // const btnNovoFluxo = this.props.screenProps.config.indexOf('talkback') != -1 ? [{
        //     text: 'Nova seleção',
        //     onPress: () => focusOnView(this.initialFocus)
        // }] : []

        const view = isTeoria ? ' o nome,  conteúdos associados e referências relativas.' : 'nome e referências relativas';
        const accBtn = 'Informações da parte. ';//isTeoria ? 'Informações da parte. ' : 'Partes referenciadas. '

        const info = (screenProps.anatomp.tipoPecaMapeamento == 'pecaFisica' ? i18n('estNom.hints.select') : i18n('estNom.hints.selectDigital')) + view;

        return (
            <Container navigation={navigation}>
                <BC _ref={r => this.initialFocus = r} body={['Roteiros', screenProps.anatomp.nome]} head={interaction} />
                <Instrucoes
                    voz={screenProps.config.indexOf('voz') != -1}
                    info={[
                        info
                    ]}
                />
                <Card style={{ marginBottom: 10 }}>
                    <Card.Header title={'Peças'} accessibilityLabel='Peças físicas. Prossiga para selecionar uma peça física.' />
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

                {screenProps.anatomp.tipoPecaMapeamento == 'pecaFisica' &&
                    <Card style={{ marginBottom: 10 }}>
                        <Card.Header title={i18n('common.anatomicalPart')} accessibilityLabel='Parte anatômica. A seguir informe a localização de uma parte para obter suas informações' />
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
                                name={i18n('common.partLocation')}
                                onDone={this.onOpen}
                                InputProps={{
                                    type: 'number',
                                    error: parte == undefined && value != '',
                                    onErrorClick: this.onErrorClick,
                                }}
                            />
                            {<Button
                                ref={r => this.refBtnDetalhes = r}
                                accessibilityLabel={accBtn + 'Botão. Toque duas vezes para ouvir ou retorne para informar uma nova parte'}
                                style={{ margin: 5 }}
                                disabled={(!parte && !value) || !pecaFisica}
                                onPressOut={this.onOpen}
                                type='primary'>
                                {i18n('common.partInformation')}
                            </Button>}
                            {/* {(this.props.isTeoria && screenProps.config.indexOf('talkback') == -1) && <Button ref={r => this.refBtnDetalhes = r} accessibilityLabel='Nome da parte. Botão. Toque duas vezes para obter o nome da parte' style={{margin: 5}} disabled={(!parte && !value) || !pecaFisica} onPressOut={this.onOpen} type='primary'>Nome da parte</Button>} */}
                            {/* {screenProps.config.indexOf('talkback') != -1 && <Button type='primary' onPressOut={() => focusOnView(this.fieldRef)}>Voltar para o filtro</Button>} */}
                        </Card.Body>
                    </Card>
                }

                <Modal
                    talkback={screenProps.config.indexOf('talkback') != -1}
                    open={open}
                    title={parte ? parte.parte.nome : null}
                    acc={`Aberto. Prossiga para ouvir`}
                    footer={[
                        { text: i18n('actions.close'), onPress: this.onClose, acc: `Fechar. Botão. Toque duas vezes para fechar` },
                    ]}
                >
                    {parte != undefined ? (
                        <ScrollView style={{ maxHeight: 280 }}>
                            {isTeoria && <Text accessibilityLabel='Conhecimentos teóricos. Prossiga para ouvir.' style={{ fontWeight: 'bold', marginBottom: 5 }}>{i18n('common.theoreticalKnowledge')}:</Text>}
                            {isTeoria && <ModalBody conteudos={conteudos} config={screenProps.config} />}
                            <ReferenciasRelativas
                                title={isTeoria ? <Text key='title' accessibilityLabel='Referências relativas. Prossiga para ouvir.' style={{ fontWeight: 'bold', marginTop: 15, marginBottom: 5 }}>Referências relativas:</Text> : null}
                                parte={parte.parte}
                                pecasFisicas={[pecasFisicas[pecaFisica]]}
                                attrName='partesNumeradas'
                                isTeoria={isTeoria}
                                conteudos={screenProps.anatomp.roteiro.conteudos}
                                config={screenProps.config}
                            />
                        </ScrollView>
                    ) :
                        (<Text style={{ padding: 5, textAlign: 'center' }}>Parte não setada nesta peça física</Text>
                        )}
                </Modal>

                {screenProps.anatomp.tipoPecaMapeamento == 'pecaDigital' &&
                    <Card style={{ marginBottom: 10 }}>
                        <Card.Header title={"Peça digital"} />
                        <Card.Body>
                            {
                                (pecasFisicas[pecaFisica] != undefined) ? (
                                    pecasFisicas[pecaFisica].midias.map((image, idx) =>
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
                                                    onStartShouldSetResponder={this.onChangeParte(point.label)} text={point.label}
                                                    style={{ top: point.y + "%", left: point.x + "%", position: 'absolute' }}>
                                                </Badge>
                                            )}
                                            <Button
                                                onPressOut={this.onOpenImageInformation(image)}
                                                style={{
                                                    position: 'relative',
                                                    width: 60,
                                                    right: 0,
                                                    borderRadius: 100,
                                                    borderWidth: 0
                                                }}>
                                                <Icon type={'\ue629'} size='xs' />
                                            </Button>
                                        </View>
                                    )
                                ) : (<View></View>)
                            }
                        </Card.Body>
                    </Card>
                }

                <Modal
                    talkback={screenProps.config.indexOf('talkback') != -1}
                    open={openImageInformation}
                    title={'Informações'}
                    acc={`Aberto. Prossiga para ouvir`}
                    footer={[
                        { text: i18n('actions.close'), onPress: this.onCloseImageInformation, acc: `Fechar. Botão. Toque duas vezes para fechar` },
                    ]}
                >
                    {imageInformation &&
                        <Text style={{ marginBottom: 8 }}>
                            <Text style={{ fontWeight: 'bold' }}>Referência: </Text>{"\n"}
                            <Text>{imageInformation.referencia}</Text>{"\n\n"}
                            <Text style={{ fontWeight: 'bold' }}>Vista: </Text>{"\n"}
                            <Text>{imageInformation.vista}</Text>
                        </Text>
                    }
                </Modal>
            </Container>
        )
    }

    onOpen = () => this.setState({ open: true })

    onClose = () => this.setState({ open: false })

    onErrorClick = () => { Toast.info('Parte não registrada'); announceForAccessibility('Parte não registrada') }

    onOpenImageInformation = image => () => this.setState({ openImageInformation: true, imageInformation: image })

    onCloseImageInformation = () => this.setState({ openImageInformation: false })



    onChange = value => {
        const { pecasFisicas, pecaFisica } = this.state;
        const parte = pecasFisicas[pecaFisica].partesNumeradas.find(p => p.numero == value && p.referenciaRelativa.referencia == null);
        let conteudos = [];
        if (parte != undefined) {

            if (this.props.isTeoria) {
                announceForAccessibility(parte.parte.nome + '. Prossiga para ouvir as informações da parte')
                conteudos = this.props.screenProps.anatomp.roteiro.conteudos.filter(c => c.partes.find(p => p._id == parte.parte._id)).map(c => ({ texto: c.singular, midias: c.midias }));
            } else {
                const referenciaAsPartes = pecasFisicas[pecaFisica].partesNumeradas.filter(m => m.referenciaRelativa.referencia != null && m.referenciaRelativa.referencia._id == parte.parte._id)
                if (referenciaAsPartes.length > 0) {
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


    onChangeParte = value => e => {
        const { pecasFisicas, pecaFisica } = this.state;

        const parte = pecasFisicas[pecaFisica].partesNumeradas.find(p => p.numero == value && p.referenciaRelativa.referencia == null);
        let conteudos = [];
        if (parte != undefined) {

            if (this.props.isTeoria) {
                announceForAccessibility(parte.parte.nome + '. Prossiga para ouvir as informações da parte')
                conteudos = this.props.screenProps.anatomp.roteiro.conteudos.filter(c => c.partes.find(p => p._id == parte.parte._id)).map(c => ({ texto: c.singular, midias: c.midias }));
            } else {
                const referenciaAsPartes = pecasFisicas[pecaFisica].partesNumeradas.filter(m => m.referenciaRelativa.referencia != null && m.referenciaRelativa.referencia._id == parte.parte._id)

                if (referenciaAsPartes.length > 0) {
                    announceForAccessibility(parte.parte.nome + '. Prossiga para ouvir as partes referenciadas')
                } else {
                    announceForAccessibility(parte.parte.nome)
                }
            }
        } else {
            announceForAccessibility('Parte não setada nesta peça física')
        }
        this.setState({ value, parte, conteudos })

        this.onOpen();

    }

    onSelectPF = pecaFisica => e => {
        this.setState({ pecaFisica: pecaFisica._id, parte: undefined, value: '' })
        announceForAccessibility(`${pecaFisica.nome} selecionado.`)
    }

    onGetRef = r => { this.fieldRef = r }
}

export default withI18n(FormEstNom);