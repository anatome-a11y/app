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

import { announceForAccessibility, focusOnView } from 'react-native-accessibility';


class Form extends Component {


    componentDidMount() {
        // this.props.onSetFocus(this.props.count)
    }


    componentWillReceiveProps(next) {
        if (this.props.count != next.count) {
            this.props.onSetFocus(next.count)
        }
    }

    render() {
        const {
            data,
            timer,
            tentativas,
            pecasFisicas,
            limite,
            count,
            onReadNFC,
            onStopNFC,
            value,
            idx,
            onGetRef,
            onChangeValor,
            onErrorClick,
            onSubmit,
            onSetFocus
        } = this.props;

        const { modo, pecaFisica } = data;

        let helper = undefined;


        if (value != '') {
            const pt = pecasFisicas[pecaFisica._id].partesNumeradas.find(p => p.numero == value);
            helper = pt == undefined ? _ni : pt.parte.nome;
        }

        const placeholder = modo == 'singular' ? 'Parte' : `Parte ${idx + 1}`;

        const label = value == '' ? placeholder : helper;

        return (timer > 0 && tentativas < _maxTentativa) ? (
            <ListItem key={idx} >
                <InputItem
                    ref={onGetRef(count, idx)}
                    type='number'
                    value={value}
                    onFocus={() => onReadNFC(onChangeValor(idx))}
                    onBlur={onStopNFC}
                    onChange={onChangeValor(idx)}
                    error={label == _ni}
                    placeholder={placeholder}
                    onErrorClick={onErrorClick}
                    onSubmitEditing={() => modo == 'singular' || idx == limite ? onSubmit() : onSetFocus(count, idx + 1)}
                />
                {/* <View style={{ marginTop: 5, paddingLeft: 10 }}>
                    <Brief >{helper}</Brief>
                </View> */}
            </ListItem>
        ) : (
                value == '' ? <ListItem key={idx} >{_ni}</ListItem> : <ListItem key={idx} >{value + ' - ' + label}</ListItem>
            )
    }
}





class FormContainer extends React.Component {

    nomeDaPeca = null;
    dicaDaParte = null;

    componentDidMount() {
        this.time2Focus = setTimeout(() => {
            focusOnView(this.nomeDaPeca)
        }, 500)
    }

    componentWillReceiveProps(next) {
        const { mainState } = this.props;

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
        const { screenProps, mainState, onGetRef, onSetFocus, onChangeValor, onErrorClick, onSubmit } = this.props;
        const { anatomp, onReadNFC, onStopNFC } = screenProps;
        const { count, total, data, timer, pecasFisicas, tentativas } = mainState;
        const title = data[count].pecaFisica.nome + ' - ' + anatomp.nome;

        return (
            <View>
                <Card>
                    <Card.Header title={<Text accessibilityLabel={`Peça: ${title}. Prossiga para ouvir a dica da parte.`} ref={r => this.nomeDaPeca = r}>{title}</Text>} />
                    <Card.Body>
                        <View>
                            <Text ref={r => this.dicaDaParte = r} accessibilityLabel={`Dica: ${data[count].texto}. Prossiga para informar ${data[count].valores.length > 1 ? 'os nomes das partes' : 'o nome da parte'}`} style={{ margin: 10, fontSize: 18, textAlign: 'center' }}>{data[count].texto}</Text>
                            <List>
                                {data[count].valores.map((value, idx) => (
                                    <View key={count + '-' + idx}>
                                        <Form
                                            data={data[count]}
                                            timer={timer}
                                            tentativas={tentativas}
                                            pecasFisicas={pecasFisicas}
                                            limite={data[count].valores.length - 1}
                                            count={count}
                                            onReadNFC={onReadNFC}
                                            onStopNFC={onStopNFC}
                                            onGetRef={onGetRef}
                                            onSetFocus={onSetFocus}
                                            onChangeValor={onChangeValor}
                                            onErrorClick={onErrorClick}
                                            onSubmit={onSubmit}
                                            value={value}
                                            idx={idx}
                                        />
                                    </View>
                                ))}
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
                        <Flex accessible={true}>
                            <View accessibilityLabel={`Etapa ${count + 1} de ${total}.`} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                <Text>Etapa</Text>
                                <Tag><Text>{`${count + 1}/${total}`}</Text></Tag>
                            </View>
                            <View accessibilityLabel={`Tentativa ${tentativas + 1} de ${_maxTentativa}.`} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                <Text>Tentativas</Text>
                                <Tag><Text>{tentativas}/{_maxTentativa}</Text></Tag>
                            </View>
                            <View accessibilityLabel={`Tempo restante ${timer} segundos`} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                <Text>Tempo</Text>
                                <Tag><Text>{timer}</Text></Tag>
                            </View>
                        </Flex>
                    </ListItem>
                </List>
            </View>
        )
    }
}




class Resultados extends React.Component {

    mainView = null;

    componentDidMount(){
        setTimeout(() => {
            focusOnView(this.mainView)
        }, 500)
    }


    render() {
        const { data, onRepeat } = this.props;

        const erros = data.filter(d => d.acertou == false);
        const total = data.length;
        const acertos = total - erros.length
        const aprov = Number(((acertos * 100) / total).toFixed(2));

        const accLabel = `Total de questões: ${total}. Acertos: ${acertos}. Aproveitamento: ${aprov} por cento.`;

        return (
            <View>
                <View ref={r => this.mainView = r} accessible={true} accessibilityLabel={accLabel}>
                    <Card style={{ marginBottom: 15 }}>
                        <Card.Header title='Placar (acertos)' />
                        <Card.Body>
                            <Text style={{ flex: 1, fontSize: 35, textAlign: 'center', fontWeight: 'bold' }}>{acertos} /<Text>{total}</Text></Text>
                            <Text style={{ flex: 1, fontSize: 25, textAlign: 'center' }}>{aprov}% de acertos</Text>
                        </Card.Body>
                    </Card>
                </View>

                {
                    (acertos != total) && (
                        <List renderHeader={() => 'Perguntas com resposta incorreta'}>
                            {
                                erros.map((e, idx) => (
                                    <ListItem key={idx}>{e.texto}</ListItem>
                                ))
                            }
                        </List>
                    )
                }

                <Button style={{ flex: 1 }} onPressOut={onRepeat} type='primary'>Treinar novamente</Button>
            </View>
        )
    }
}



const ListItem = List.Item;
const { Brief } = List.Item;

const _maxTentativa = 3;
const _tempoMax = 60;
const _ni = 'Não identificado'

class TeoTreLoc extends Component {
    timer = null;
    fieldRef = []

    state = {
        data: [],
        count: 0,
        total: 0,
        timer: _tempoMax,
        pecasFisicas: [],
        tentativas: 0,
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
            mapa.localizacao.forEach(loc => {
                pecasFisicas[loc.pecaFisica._id].partesNumeradas.push({ parte: mapa.parte, numero: loc.numero })
            })
        })

        const flatData = []

        //Itera em cada conteudo e o vincula às peças fisicas
        anatomp.roteiro.conteudos.forEach(conteudo => {
            //Busca as peças fisicas que contem o conteudo
            Object.keys(pecasFisicas).forEach(key => {
                const pfTemAParteDoConteudo = pecasFisicas[key].partesNumeradas.find(pn => conteudo.partes.find(p => p._id == pn.parte._id) != undefined)

                if (pfTemAParteDoConteudo) {
                    const { nome, _id } = pecasFisicas[key];
                    //Substitui as partes do conteudo por partes numeradas
                    const partes = pecasFisicas[key].partesNumeradas.filter(pn => conteudo.partes.find(p => p._id == pn.parte._id) != undefined);

                    if (conteudo.singular != '') {
                        flatData.push({ pecaFisica: { nome, _id }, modo: 'singular', texto: conteudo.singular, partes })
                    }
                    if (conteudo.plural != '') {
                        flatData.push({ pecaFisica: { nome, _id }, modo: 'plural', texto: conteudo.plural, partes })
                    }
                }
            })
        })

        const dados = flatData.map(fd => ({ ...fd, acertou: false, valores: fd.modo == 'singular' ? Array(1).fill('') : Array(fd.partes.length).fill('') }));

        this.fieldRef = flatData.map(fd => fd.modo == 'singular' ? Array(1).fill(null) : Array(fd.partes.length).fill(null))

        this.setState({ data: dados, total: dados.length, pecasFisicas: { ...pecasFisicas } }, () => {
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
        const { data, count } = this.state;

        return (
            <Container navigation={navigation}>
                {count < data.length ? (
                    <FormContainer
                        screenProps={screenProps}
                        mainState={this.state}
                        onGetRef={this.onGetRef}
                        onSetFocus={this.onSetFocus}
                        onChangeValor={this.onChangeValor}
                        onErrorClick={this.onErrorClick}
                        onSubmit={this.onSubmit}
                    />
                ) : <Resultados data={data} onRepeat={this.onRepeat} />}
            </Container>
        )
    }

    onRepeat = () => {
        const { data } = this.state;
        const dados = data.map(fd => ({ ...fd, acertou: false, valores: fd.modo == 'singular' ? Array(1).fill('') : Array(fd.partes.length).fill('') }));

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

    onGetRef = (count, idx) => r => { this.fieldRef[count][idx] = r }

    onSetFocus = (count, idx = 0) => { this.fieldRef[count][idx].focus() }

    checkAcertos = item => {
        if (item.modo == 'singular') {
            return item.partes.find(p => p.numero == item.valores[0]) != undefined
        } else {
            return item.partes.every(p => item.valores.indexOf(p.numero) != -1)
        }
    }

    onCount = () => {
        this.timer = setInterval(() => {
            this.setState({ timer: this.state.timer - 1 })
        }, 1000);
    }

    onChangeValor = idx => valor => {
        const { data, count, timer } = this.state;

        this.setState({
            data: [
                ...data.slice(0, count),
                {
                    ...data[count],
                    valores: [
                        ...data[count].valores.slice(0, idx),
                        valor,
                        ...data[count].valores.slice(idx + 1),
                    ]
                },
                ...data.slice(count + 1),
            ]
        })
    }
}

export default TeoTreLoc;