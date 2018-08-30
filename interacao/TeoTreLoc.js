import React, { Component } from 'react';

import { View, Text } from 'react-native';
import Container from '../Container';
import List from 'antd-mobile-rn/lib/list';
import Card from 'antd-mobile-rn/lib/card';
import Toast from 'antd-mobile-rn/lib/toast';
import Button from 'antd-mobile-rn/lib/button';
import Flex from 'antd-mobile-rn/lib/flex';
import InputItem from 'antd-mobile-rn/lib/input-item';
const ListItem = List.Item;

const _tempoMax = 10;

class TeoTreLoc extends Component {
    timer = null;

    state = {
        data: [],
        count: 0,
        total: 0,
        timer: _tempoMax,
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
                    const nome = pecasFisicas[key].nome;
                    //Substitui as partes do conteudo por partes numeradas
                    const partes = pecasFisicas[key].partesNumeradas.filter(pn => conteudo.partes.find(p => p._id == pn.parte._id) != undefined);

                    if (conteudo.singular != '') {
                        flatData.push({ pecaFisica: { nome }, modo: 'singular', texto: conteudo.singular, partes })
                    }
                    if (conteudo.plural != '') {
                        flatData.push({ pecaFisica: { nome }, modo: 'plural', texto: conteudo.plural, partes })
                    }
                }
            })
        })

        this.setState({ data: flatData.map(fd => ({ ...fd, valores: fd.modo == 'singular' ? Array(1).fill('') : Array(fd.partes.length).fill('') })), total: flatData.length }, () => {
            this.onCount();
            Toast.hide()
        })
    }


    componentWillUpdate(nextProps, nextState) {
        if (this.state.timer != 0 && nextState.timer == 0) {
            clearInterval(this.timer)
            Toast.info('Tempo limite excedido!')
        }

        if (this.state.count != nextState.count) {
            this.setState({ timer: _tempoMax })
        }
    }


    render() {
        const { navigation, screenProps } = this.props;

        const { anatomp } = screenProps;

        const { count, total, data, timer } = this.state;

        return (
            <Container navigation={navigation}>
                {
                    data.length > 0 && (
                        <View>
                            <List style={{ marginBottom: 10 }}>
                                <ListItem
                                    wrap
                                    multipleLine
                                    align="center"
                                    extra={`${count + 1}/${total} | ${timer}`}
                                >
                                    {anatomp.nome}
                                </ListItem>
                            </List>
                            <Card>
                                <Card.Header title={data[count].pecaFisica.nome} />
                                <Card.Body>
                                    <View>
                                        <Text style={{ margin: 10, fontSize: 18, textAlign: 'center' }}>{data[count].texto}</Text>
                                        {
                                            data[count].modo == 'singular' ? (
                                                <InputItem type='number' editable={timer !== 0} placeholder='Parte' value={data[count].valores[0]} onChange={this.onChangeValor(0)} />
                                            ) : data[count].valores.map((v, idx) => (
                                                <InputItem type='number' editable={timer !== 0} placeholder={`Parte ${idx + 1}`} key={idx} value={v} onChange={this.onChangeValor(idx)} />
                                            ))
                                        }
                                    </View>
                                </Card.Body>
                            </Card>
                            <Flex style={{ marginTop: 15 }}>
                                <Button style={{ flex: 1 }} >Cancelar</Button>
                                <Button style={{ flex: 1 }} onPressOut={this.onNext} type='primary'>Próximo</Button>
                            </Flex>
                        </View>
                    )
                }
            </Container>
        )
    }

    onNext = () => {
        this.setState({
            count: this.state.count + 1,
            timer: 10,
        }, () => {
            clearInterval(this.timer)
            this.onCount()
        })
    }

    onCount = () => {
        this.timer = setInterval(() => {
            this.setState({ timer: this.state.timer - 1 })
        }, 1000);
    }

    onChangeValor = idx => valor => {
        const { data, count } = this.state;

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