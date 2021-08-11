import Card from 'antd-mobile-rn/lib/card';
import List from 'antd-mobile-rn/lib/list';
import Toast from 'antd-mobile-rn/lib/toast';
import React, { Component } from 'react';
import { ScrollView, Text } from 'react-native';
import { announceForAccessibility, focusOnView } from 'react-native-accessibility';
import BC from '../components/Breadcrumbs';
import Input from '../components/Input';
import Instrucoes from '../components/Instrucoes';
import LocalizacaoPD from '../components/LocalizacaoPD';
import LocalizacaoPF from '../components/LocalizacaoPF';
import Modal from '../components/Modal';
import ReferenciasRelativas from '../components/ReferenciasRelativas';
import Container from '../Container';
import { norm } from '../utils';


const ListItem = List.Item;

class PraEstLoc extends Component {
    initialFocus = null;
    modalBody = null;
    refListaPartes = null;
    inputRef = null;

    state = {
        loading: true,
        open: false,
        openDigital: false,
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
            pecasFisicas[pf._id] = { ...pf, locFlat: [] };
        })

        //Seta as partes e seus numeros para cada peça física
        anatomp.mapa.forEach(mapa => {
            mapa.localizacao.forEach(loc => {
                pecasFisicas[loc.pecaFisica._id].locFlat.push({ parte: mapa.parte, ...loc })
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
        const { navigation, screenProps } = this.props;
        const { open, openDigital, parte, pecasFisicas, filtered } = this.state;

        const selected = parte == undefined ? '' : parte._id;
        const info = (screenProps.anatomp.tipoPecaMapeamento == 'pecaFisica' ? 'Escolha uma parte na lista de partes para obter sua localização nas peças físicas.' : 'Escolha uma parte na lista de partes para obter sua localização nas peças digitais.');

        return (
            <Container navigation={navigation}>
                <BC _ref={r => this.initialFocus = r} body={['Roteiros', screenProps.anatomp.nome]} head={'Estudo - Prático - Conteúdo-Localização'} acc='Prossiga para ouvir as instruções' />
                <Instrucoes
                    voz={screenProps.config.indexOf('voz') != -1}
                    info={[
                        info,
                        'Caso deseje, utilize o filtro a seguir para encontrar uma parte.'
                    ]}
                />
                <Card>
                    <Card.Header title='Partes a selecionar' accessibilityLabel='Partes a selecionar. A seguir informe uma parte para filtrar a lista de partes' />
                    <Card.Body >
                        <Input
                            _ref={this.getRef}
                            value={this.state.pesquisa}
                            onChange={this.onFilter}
                            name={'Filtro de partes'}
                            onSkipAlternatives={() => focusOnView(this.refListaPartes)}
                        />
                        <List renderHeader={() => `Lista de partes`} accessibilityLabel={`Lista de partes filtradas. Na lista ${filtered.length} partes. Prossiga para ouvir os nomes das partes.`} ref={r => this.refListaPartes = r}>
                            {filtered.length > 0 ? filtered.map(c => (
                                <List.Item accessible accessibilityLabel={`${c.nome}. Botão. Toque duas vezes para abrir.`} wrap multipleLine key={c._id} onClick={this.onSelectParte(c)}>
                                    <Text>{c.nome}</Text>
                                </List.Item>
                            )) : <List.Item accessibilityLabel='Nenhuma parte encontrada. Altere as palavras chave do campo de busca.' wrap multipleLine>Nenhuma parte encontrada</List.Item>}
                        </List>
                        {/* {screenProps.config.indexOf('talkback') != -1 && <Button type='primary' onPressOut={() => focusOnView(this.inputRef)}>Voltar para o filtro</Button>} */}
                    </Card.Body>
                </Card>

                {/* Modal Peças Físicas */}
                <Modal
                    talkback={screenProps.config.indexOf('talkback') != -1}
                    open={open}
                    title={parte ? parte.nome : null}
                    acc={`Parte ${parte ? parte.nome : ''}. Aberto. Prossiga para ouvir a localização nas peças físicas.`}
                    footer={[
                        { text: 'Fechar', onPress: this.onClose, acc: `Fechar. Botão. Toque duas vezes para fechar os detalhes da Parte ${parte ? parte.nome : ''}` },
                    ]}
                >
                    <ScrollView style={{ maxHeight: 280 }}>
                        <LocalizacaoPF parte={parte} pecasFisicas={pecasFisicas} />
                        <ReferenciasRelativas parte={parte} pecasFisicas={pecasFisicas} />
                    </ScrollView>
                </Modal>

                {/* Modal Peças Digitais */}
                <Modal
                    talkback={true}
                    open={openDigital}
                    title={parte ? parte.nome : null}
                    acc={`Aberto. Prossiga para ouvir o nome da parte e sua localização nas peças digitais.`}
                    footer={[
                        { text: 'Fechar', onPress: this.onCloseDigital, acc: `Fechar. Botão. Toque duas vezes para fechar os detalhes da Parte ${parte ? parte.nome : ''}` },
                    ]}
                >
                    <ScrollView style={{ maxHeight: '87%', padding: 5 }}>
                        <ReferenciasRelativas parte={parte} pecasFisicas={pecasFisicas} />
                        <LocalizacaoPD parte={parte} pecasFisicas={pecasFisicas} exibirLabel={true} mapa={screenProps.anatomp.mapa}/>
                    </ScrollView>
                </Modal>
            </Container>
        )
    }

    getRef = r => this.inputRef = r

    onFilter = pesquisa => {
        this.setState({
            pesquisa
        }, () => {
            const _filtered = this.props.screenProps.anatomp.roteiro.partes.filter(c => {
                return norm(c.nome).indexOf(norm(pesquisa)) != -1
            });

            const filtered = _filtered != undefined ? _filtered : null

            this.setState({ filtered }, () => {
                if (filtered.length > 0) {
                    const naLista = `Na lista ${filtered.length} partes. Prossiga para selecionar.`;
                    if (pesquisa) {
                        announceForAccessibility(`Texto detectado: ${pesquisa}. ${naLista}`)
                    } else {
                        announceForAccessibility(`Texto removido. ${naLista}`)
                    }
                } else {
                    announceForAccessibility(`Nenhuma parte foi encontrada para o filtro ${pesquisa}`)
                }
            })
        })
    }


    onClose = () => {
        this.setState({
            open: false,
        });
    }

    onOpenDigital = () => this.setState({ openDigital: true })

    onCloseDigital = () => this.setState({ openDigital: false })

    onSelectParte = parte => e => {


        if (this.props.screenProps.anatomp.tipoPecaMapeamento == 'pecaFisica') {
            this.setState({ parte, open: true })
        } else if (this.props.screenProps.anatomp.tipoPecaMapeamento == 'pecaDigital') {
            this.setState({ parte, openDigital: true })
        }
    }

}

export default PraEstLoc;