import React, { Component } from 'react';

import { View, Text, TouchableHighlight, TextInput } from 'react-native';
import Container from '../Container';
import List from 'antd-mobile-rn/lib/list';
import Card from 'antd-mobile-rn/lib/card';
import Toast from 'antd-mobile-rn/lib/toast';
import Button from 'antd-mobile-rn/lib/button';
import Flex from 'antd-mobile-rn/lib/flex';
import Tag from 'antd-mobile-rn/lib/tag';
import InputItem from 'antd-mobile-rn/lib/input-item';
import Checkbox from 'antd-mobile-rn/lib/checkbox';

import { announceForAccessibility, focusOnView } from 'react-native-accessibility';

import Resultados from './Resultados'
import Placar from './Placar'

import Input from '../components/Input'

import { norm } from '../utils'

import BC from '../components/Breadcrumbs'


class FormContainer extends React.Component {

    nomeDaPeca = null;
    dicaDaParte = null;
    listRef = null;

    state = {
        found: null,
        pesquisa: ''
    }

    componentDidMount() {
        this.time2Focus = setTimeout(() => {
            focusOnView(this.nomeDaPeca)
        }, 500)
    }

    componentWillReceiveProps(next) {
        const { mainState, screenProps } = this.props;

        //Se mudou a peça física, foco na peça física
        if (mainState.data[mainState.count].pecaFisica.nome != next.mainState.data[next.mainState.count].pecaFisica.nome) {
            focusOnView(this.nomeDaPeca)
        } else {
            //Se muou apenas a parte: foco na parte
            if (mainState.count != next.mainState.count) {
                focusOnView(this.dicaDaParte)
            }
        }

    }

    componentWillUnmount() {
        clearInterval(this.time2Focus)
    }


    render() {
        const { screenProps, mainState, onGetRef, onSubmit } = this.props;
        const { anatomp } = screenProps;
        const { count, total, data, timer, tentativas } = mainState;
        const title = data[count].pecaFisica.nome + ' - ' + anatomp.nome;
        const { found, pesquisa } = this.state;

        const value = data[count].valores[0];


        const _Itens = (found && pesquisa != '') ? (
            <List.Item wrap multipleLine key={found._id}>
                <Checkbox checked={value._id == found._id} onChange={this.onChange(found)} >
                    <View style={{ marginLeft: 15 }} >
                        <Text>{found.nome}</Text>
                    </View>
                </Checkbox>
            </List.Item>
        ) : <List.Item><Text>Nenhuma parte foi informada</Text></List.Item>

        return (
            <View>
                <BC body={['Roteiros', anatomp.nome]} head={'Treinamento-Prático-Nomear'} />
                <Card>
                    <Card.Header title={<Text accessibilityLabel={`Peça: ${title}. Prossiga para ouvir o número da parte anatômica`} ref={r => this.nomeDaPeca = r}>{title}</Text>} />
                    <Card.Body>
                        <View>
                            <Text ref={r => this.dicaDaParte = r} accessibilityLabel={`Número ${data[count].numero}. Prossiga para buscar a parte correspondente.`} style={{ margin: 10, fontSize: 18, textAlign: 'center' }}>Número {data[count].numero}</Text>
                            <List>
                                <ListItem>
                                    <Input
                                        _ref={onGetRef(count)}
                                        value={this.state.pesquisa}
                                        onChange={this.onFind}
                                        name={'Nome da parte'}
                                        onDone={onSubmit}
                                    />
                                </ListItem>
                            </List>
                            <List ref={r => this.listRef = r} accessibilityLabel={`Nome da parte correspondente. Parte informada como resposta`} renderHeader={() => 'Nome da Parte correspondente'}>
                                {_Itens}
                            </List>
                        </View>
                    </Card.Body>
                </Card>
                <Flex style={{ marginTop: 15, marginBottom: 15 }}>
                    <Button accessibilityLabel={`Próximo. Botão. Toque duas vezes para obter a próxima dica ou prossiga para ouvir as informações extras desta etapa`} style={{ flex: 1 }} onPressOut={onSubmit} type='primary'>Próximo</Button>
                </Flex>
                <List>
                    <ListItem
                        wrap
                        multipleLine
                        align="center"
                    >
                        <Placar
                            count={count}
                            total={total}
                            tentativas={tentativas}
                            _maxTentativa={_maxTentativa}
                            timer={timer}
                        />
                    </ListItem>
                </List>
            </View>
        )
    }

    onFocus = () => {
        announceForAccessibility(`Após o sinal, informe uma expressão para filtrar a lista de partes`)
        setTimeout(() => {
            this.props.screenProps.onStartRecognizing()
        }, 5000)
    }

    onFind = pesquisa => {
        this.setState({
            pesquisa
        }, () => {
            const _filtered = this.props.mainState.partes.find(c => {
                return norm(c.nome) == norm(this.state.pesquisa)
            });      

            const found = _filtered != undefined ? _filtered : null

            this.setState({ found }, () => {
                // announceForAccessibility(`Na lista ${found.length} partes: ${found.map(f => f.nome).join(', ')}`)
            })
        })
    }


    onChange = parte => () => {
        this.props.onChangeValor(parte)
        announceForAccessibility(`${parte.nome} selecionado`)
    }
}



const ListItem = List.Item;

const _maxTentativa = 3;
const _tempoMax = 60;
const _ni = 'Não identificado'

class PraTreNom extends Component {
    timer = null;
    fieldRef = []

    state = {
        data: [],
        count: 0,
        total: 0,
        timer: _tempoMax,
        partes: [],
        tentativas: 0,
        loading: true
    }

    componentDidMount() {
        const { anatomp } = this.props.screenProps;

        Toast.loading('Aguarde...', 0)
        announceForAccessibility('Aguarde...')

        //Objeto de indexação
        let pecasFisicas = {};
        anatomp.pecasFisicas.forEach(pf => {
            pecasFisicas[pf._id] = { pf, partesNumeradas: [] };
        })

        //Seta as partes e seus numeros para cada peça física
        anatomp.mapa.forEach(mapa => {
            mapa.localizacao.map(loc => pecasFisicas[loc.pecaFisica._id].partesNumeradas.push({ parte: mapa.parte, numero: loc.numero }))            
        })


        let flatData = [];

        Object.keys(pecasFisicas).forEach(key => {
            const { partesNumeradas, pf } = pecasFisicas[key];
            partesNumeradas.forEach(pn => {
                flatData = [...flatData, { ...pn, pecaFisica: pf }]
            })
        })


        const dados = flatData.map(fd => ({ ...fd, acertou: false, valores: [''] }));

        this.fieldRef = flatData.map(fd => [null])

        this.setState({ loading: false, data: dados, total: dados.length, partes: anatomp.roteiro.partes }, () => {
            this.onCount();
            Toast.hide();
        })

    }


    componentWillUpdate(nextProps, nextState) {
        if (this.state.timer != 0 && nextState.timer == 0) {
            clearInterval(this.timer)
            if (nextState.count !== nextState.data.length) {
                Toast.info('Tempo limite excedido!')
                announceForAccessibility('Tempo limite excedido!')
            }
        }

        if (this.state.count != nextState.count) {
            this.setState({ timer: _tempoMax });
        }
    }

    componentWillUnmount() {
        clearInterval(this.timer)
    }

    render() {
        const { navigation, screenProps } = this.props;
        const { data, count, loading } = this.state;

        const _View = loading ? null : (
            count < data.length ? (
                <FormContainer
                    screenProps={screenProps}
                    mainState={this.state}
                    onGetRef={this.onGetRef}
                    onChangeValor={this.onChangeValor}
                    onSubmit={this.onSubmit}
                />
            ) : <Resultados data={data} onRepeat={this.onRepeat} formatter={e => `Numero ${e.numero}, peça ${e.pecaFisica.nome}`} />
        )

        return (
            <Container navigation={navigation}>
                {_View}
            </Container>
        )
    }

    onRepeat = () => {
        const { data } = this.state;
        const dados = data.map(fd => ({ ...fd, acertou: false, valores: [''] }));

        clearInterval(this.timer)

        this.setState({
            data: dados,
            count: 0,
            timer: _tempoMax,
            tentativas: 0
        }, () => this.onCount())
    }

    onErrorClick = () => { Toast.info('Parte não registrada'); announceForAccessibility('Parte não registrada') }

    onSubmit = () => {
        const { data, count, tentativas, timer } = this.state;

        let acertou = this.checkAcertos(data[count]);

        if (acertou) {
            Toast.success('Acertou!', 3, this.onNext(acertou));
            announceForAccessibility('Acertou!')
        } else {
            this.setState({ tentativas: tentativas + 1 })
            if (tentativas == _maxTentativa - 1 || timer == 0) {
                Toast.fail('Você errou.', 3, this.onNext(acertou))
                announceForAccessibility('Você errou.')
            } else {
                const num = _maxTentativa - tentativas - 1;
                const msg = `Resposta incorreta. Você tem mais ${num} tentativa${num == 1 ? '' : 's'}`
                Toast.fail(msg, 3, () => this.onSetFocus(count))
                announceForAccessibility(msg)
            }
        }

    }


    onNext = acertou => () => {
        const { data, count, tentativas } = this.state;

        this.setState({
            count: count + 1,
            timer: _tempoMax,
            tentativas: 0,
            data: [
                ...data.slice(0, count),
                {
                    ...data[count],
                    acertou
                },
                ...data.slice(count + 1),
            ]
        }, () => {
            clearInterval(this.timer)
            this.onCount()
        })

    }

    onGetRef = (count) => r => { this.fieldRef[count] = r }

    onSetFocus = (count) => {
        const { config } = this.props.screenProps;
        if (config.indexOf('nfc') == -1 && config.indexOf('voz') == -1) {
            this.fieldRef[count].focus()
        } else {
            if (config.indexOf('talkback') !== -1) {
                focusOnView(this.fieldRef[count])
            }
        }
    }

    checkAcertos = item => {
        return item.valores[0]._id == item.parte._id
    }

    onCount = () => {
        this.timer = setInterval(() => {
            this.setState({ timer: this.state.timer - 1 })
        }, 1000);
    }

    onChangeValor = valor => {
        const { data, count, timer } = this.state;

        this.setState({
            data: [
                ...data.slice(0, count),
                {
                    ...data[count],
                    valores: [valor]
                },
                ...data.slice(count + 1),
            ]
        })
    }
}

export default PraTreNom;