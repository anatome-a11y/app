import React, { Component } from 'react';

import { View, Text } from 'react-native';
import Container from '../Container';
import List from 'antd-mobile-rn/lib/list';
import Card from 'antd-mobile-rn/lib/card';
import Toast from 'antd-mobile-rn/lib/toast';
import Button from 'antd-mobile-rn/lib/button';
import Flex from 'antd-mobile-rn/lib/flex';
import Tag from 'antd-mobile-rn/lib/tag';
import InputItem from 'antd-mobile-rn/lib/input-item';
const ListItem = List.Item;
const { Brief } = List.Item;

const _maxTentativa = 3;
const _tempoMax = 60;
const _ni = 'Não identificado'

class TeoTreLoc extends Component {
    timer = null;
    refs = []

    state = {
        data: [],
        count: 0,
        total: 0,
        timer: _tempoMax,
        pecasFisicas: [],
        tentativas: 0
    }

    componentDidMount() {
        const { anatomp } = this.props.screenProps;

        Toast.loading('Aguarde...', 0)

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

        this.refs = flatData.map(fd => fd.modo == 'singular' ? Array(1).fill(null) : Array(fd.partes.length).fill(null))

        this.setState({ data: dados, total: dados.length, pecasFisicas: { ...pecasFisicas } }, () => {
            this.onCount();
            Toast.hide()
        })
    }


    componentWillUpdate(nextProps, nextState) {
        if (this.state.timer != 0 && nextState.timer == 0) {
            clearInterval(this.timer)
            if (nextState.count !== nextState.data.length) {
                Toast.info('Tempo limite excedido!')
            }
        }

        if (this.state.count != nextState.count) {
            this.setState({ timer: _tempoMax })
        }
    }

    componentWillUnmount() {
        clearInterval(this.timer)
    }

    render() {
        const { navigation } = this.props;
        const { data, count } = this.state;

        return (
            <Container navigation={navigation}>
                {count < data.length ? this.showForm() : this.showResults()}
            </Container>
        )
    }

    showResults = () => {
        const { data } = this.state;

        const erros = data.filter(d => d.acertou == false);
        const total = data.length;
        const acertos = total - erros.length

        return (
            <View>
                <Card style={{ marginBottom: 15 }}>
                    <Card.Header title='Placar (acertos)' />
                    <Card.Body>
                        <Text style={{ flex: 1, fontSize: 35, textAlign: 'center', fontWeight: 'bold' }}>{acertos} /<Text>{total}</Text></Text>
                        <Text style={{ flex: 1, fontSize: 25, textAlign: 'center' }}>{Number(((acertos*100) / total).toFixed(2))}</Text>
                    </Card.Body>
                </Card>

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

                <Button style={{ flex: 1 }} onPressOut={this.onRepeat} type='primary'>Treinar novamente</Button>
            </View>
        )
    }

    showForm = () => {
        const { navigation, screenProps } = this.props;

        const { anatomp } = screenProps;

        const { count, total, data, timer, pecasFisicas, tentativas } = this.state;

        return (data.length > 0 && (
            <View>
                <List renderHeader={() => anatomp.nome} style={{ marginBottom: 10 }}>
                    <ListItem
                        wrap
                        multipleLine
                        align="center"
                    >
                        <Flex>
                            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                <Text>Número</Text>
                                <Tag><Text>{`${count + 1}/${total}`}</Text></Tag>
                            </View>
                            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                <Text>Tentativas</Text>
                                <Tag><Text>{tentativas}/{_maxTentativa}</Text></Tag>
                            </View>
                            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                <Text>Tempo</Text>
                                <Tag><Text>{timer}</Text></Tag>
                            </View>
                        </Flex>
                    </ListItem>
                </List>
                <Card>
                    <Card.Header title={data[count].pecaFisica.nome} />
                    <Card.Body>
                        <View>
                            <Text style={{ margin: 10, fontSize: 18, textAlign: 'center' }}>{data[count].texto}</Text>
                            <List>
                                {data[count].valores.map(this.onGetCampos(data[count], timer, tentativas, pecasFisicas, data[count].valores.length - 1, count))}
                            </List>
                        </View>
                    </Card.Body>
                </Card>
                <Flex style={{ marginTop: 15 }}>
                    {/* <Button style={{ flex: 1 }} >Cancelar</Button> */}
                    <Button style={{ flex: 1 }} onPressOut={this.onSubmit} type='primary'>Próximo</Button>
                </Flex>
            </View>
        )
        )
    }

    onGetCampos = ({ modo, pecaFisica }, timer, tentativas, pecasFisicas, limite, count) => (v, idx) => {
        let helper = undefined;


        if (v != '') {
            const pt = pecasFisicas[pecaFisica._id].partesNumeradas.find(p => p.numero == v);
            helper = pt == undefined ? _ni : pt.parte.nome;
        }

        const placeholder = modo == 'singular' ? 'Parte' : `Parte ${idx + 1}`;

        const label = v == '' ? placeholder : helper;

        return (timer > 0 && tentativas < _maxTentativa) ? (
            <ListItem key={idx} >
                <InputItem
                    ref={r => this.refs[count][idx] = r}
                    type='number'
                    value={v}
                    onChange={this.onChangeValor(idx)}
                    error={label == _ni}
                    placeholder={placeholder}
                    onErrorClick={this.onErrorClick}
                    onSubmitEditing={() => modo == 'singular' || idx == limite ? this.onSubmit() : this.refs[count][idx + 1].focus()}
                />
                <View style={{ marginTop: 5, paddingLeft: 10 }}>
                    <Brief >{helper}</Brief>
                </View>
            </ListItem>
        ) : (
                v == '' ? <ListItem key={idx} >{_ni}</ListItem> : <ListItem key={idx} >{v + ' - ' + label}</ListItem>
            )
    }

    onRepeat = () => {
        const {data} = this.state;
        const dados = data.map(fd => ({ ...fd, acertou: false, valores: fd.modo == 'singular' ? Array(1).fill('') : Array(fd.partes.length).fill('') }));        
    
        this.setState({
            data: dados,
            count: 0,
            timer: _tempoMax,
            tentativas: 0
        }, () => this.onCount())
    }

    onErrorClick = () => Toast.info('Parte não registrada')

    onSubmit = () => {
        const { data, count, tentativas, timer } = this.state;

        let acertou = this.checkAcertos(data[count]);

        if (acertou) {
            Toast.success('Acertou!', 3, this.onNext(acertou))
        } else {
            this.setState({ tentativas: tentativas + 1 })
            if (tentativas == _maxTentativa - 1 || timer == 0) {
                Toast.fail('Você errou.', 3, this.onNext(acertou))
            } else {
                const num = _maxTentativa - tentativas - 1;
                Toast.fail(`Resposta incorreta. Você tem mais ${num} tentativa${num == 1 ? '' : 's'}`, 3)
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