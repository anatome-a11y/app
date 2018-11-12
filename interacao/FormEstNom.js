import React, { Component } from 'react';

import { View, Text, TouchableHighlight, ScrollView } from 'react-native';
import Container from '../Container';
import List from 'antd-mobile-rn/lib/list';
import Toast from 'antd-mobile-rn/lib/toast';

import { announceForAccessibility, focusOnView } from 'react-native-accessibility';
import Input from '../components/Input'
import {Simple as Option} from '../components/Option'

import Card from 'antd-mobile-rn/lib/card';
import Button from 'antd-mobile-rn/lib/button';


const ListItem = List.Item;

import BC from '../components/Breadcrumbs'
import Instrucoes from '../components/Instrucoes'
import Modal from '../components/Modal'


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
            mapa.localizacao.map(loc => pecasFisicas[loc.pecaFisica._id].partesNumeradas.push({ parte: mapa.parte, numero: loc.numero }));
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
        const instrucaoModal = isTeoria ? 'Prossiga para ouvir os conteúdos associados' : 'Prossiga para fechar'

        return (
            <Container navigation={navigation}>
                    <BC _ref={r => this.initialFocus = r}  body={['Roteiros', screenProps.anatomp.nome]} head={interaction} />
                <Instrucoes
                    info={[
                        'Selecione uma peça física e informe uma parte para obter seu '+view,
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
                                if(this.props.isTeoria){
                                    focusOnView(this.refBtnDetalhes)
                                }else{
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
                        {this.props.isTeoria && <Button ref={r => this.refBtnDetalhes = r} accessibilityLabel='Conteúdos da parte. Botão. Toque duas vezes para pesquisar a parte informada.' style={{margin: 5}} disabled={(!parte && !value) || !pecaFisica} onPressOut={this.onOpen} type='primary'>Conteúdos da parte</Button>}
                        {(this.props.isTeoria && screenProps.config.indexOf('talkback') == -1) && <Button ref={r => this.refBtnDetalhes = r} accessibilityLabel='Nome da parte. Botão. Toque duas vezes para obter o nome da parte' style={{margin: 5}} disabled={(!parte && !value) || !pecaFisica} onPressOut={this.onOpen} type='primary'>Nome da parte</Button>}
                        {screenProps.config.indexOf('talkback') != -1 && <Button type='primary' onPressOut={() => focusOnView(this.fieldRef)}>Voltar para o filtro</Button>}
                    </Card.Body>
                </Card>

                <Modal
                    talkback={screenProps.config.indexOf('talkback') != -1}
                    open={open}
                    title={parte ? parte.parte.nome : null}
                    acc={`Parte ${parte ? parte.parte.nome : ''}. Aberto.` + instrucaoModal}
                    footer={[
                        { text: 'Fechar', onPress: this.onClose, acc: `Fechar. Botão. Toque duas vezes para fechar` },
                    ]}                    
                >
                    {parte != undefined ? <ScrollView style={{maxHeight: 280}}>
                        {isTeoria && <View>
                            {
                                conteudos.length == 0 ? (
                                    <View key='emptyList'>
                                        <Text>Nenhum conteúdo foi encontrado</Text>
                                    </View>
                                ) : (conteudos.map(c => (
                                    <View key={c} style={{marginBottom: 8}}>
                                        <Text>{c}</Text>
                                    </View>
                                )))
                            }
                        </View>}
                    </ScrollView> : <Text style={{padding: 5, textAlign: 'center'}}>Parte não setada nesta peça física</Text>}
                </Modal>
            </Container>
        )
    }

    onOpen = () => this.setState({open: true})

    onClose = () => this.setState({open: false})

    onErrorClick = () => { Toast.info('Parte não registrada'); announceForAccessibility('Parte não registrada') }



    onChange = value => {
        const { pecasFisicas, pecaFisica } = this.state;
        const parte = pecasFisicas[pecaFisica].partesNumeradas.find(p => p.numero == value);

        if(parte != undefined){
            const detalhes = this.props.isTeoria ? '. Prossiga para ouvir os conteúdos associados' : '';
            announceForAccessibility(parte.parte.nome + detalhes)
        }else{
            announceForAccessibility('Parte não setada nesta peça física')
        }

        const conteudos = (parte == undefined || !this.props.isTeoria) ? [] : this.props.screenProps.anatomp.roteiro.conteudos.filter(c => c.partes.find(p => p._id == parte.parte._id)).map(c => c.singular)
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