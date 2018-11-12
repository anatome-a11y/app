import React, { Component } from 'react';

import { View, Text } from 'react-native';
import List from 'antd-mobile-rn/lib/list';
import Card from 'antd-mobile-rn/lib/card';
import Button from 'antd-mobile-rn/lib/button';
import Flex from 'antd-mobile-rn/lib/flex';

import { announceForAccessibility, focusOnView } from 'react-native-accessibility';

import Placar from './Placar'

import Input from '../components/Input'

import BC from '../components/Breadcrumbs'
import Instrucoes from '../components/Instrucoes'


const ListItem = List.Item;

const _ni = 'Não identificado'

class Form extends Component {


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

        const placeholder = 'Parte';

        const label = value == '' ? placeholder : helper;

        return (timer > 0 && tentativas < this.props.maxTentativas) ? (
                <Input
                    isTag
                    _ref={onGetRef(count, idx)}
                    onSkipAlternatives={() => modo == 'singular' || idx == limite ? onSubmit() : onSetFocus(count, idx + 1)}                    
                    value={value}
                    onChange={onChangeValor(idx)}
                    name={placeholder}
                    onDone={() => modo == 'singular' || idx == limite ? onSubmit() : onSetFocus(count, idx + 1)}
                    InputProps={{
                        type: 'number',
                        error: label == _ni,
                        onErrorClick: onErrorClick,
                    }}
                />
        ) : (
                value == '' ? <ListItem key={idx} >{_ni}</ListItem> : <ListItem key={idx} >{value + ' - ' + label}</ListItem>
            )
    }
}





class FormTreLoc extends React.Component {

    nomeDaPeca = null;
    dicaDaParte = null;
    initialFocus = null;

    componentDidMount() {
        this.time2Focus = setTimeout(() => {
            focusOnView(this.initialFocus)
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
                console.log('mudou')
                focusOnView(this.dicaDaParte)
            }
        }
    }

    componentWillUnmount() {
        clearInterval(this.time2Focus)
    }


    render() {
        const { screenProps, mainState, onGetRef, onSetFocus, onChangeValor, onErrorClick, onSubmit, interaction, info } = this.props;
        const { anatomp, onReadNFC, onStopNFC } = screenProps;
        const { count, total, data, timer, pecasFisicas, tentativas } = mainState;
        const title = data[count].pecaFisica.nome;

        return (
            <View>
                <BC _ref={r => this.initialFocus = r} body={['Roteiros', anatomp.nome]} head={interaction} />
                <Instrucoes info={info} />
                <Card style={{ marginBottom: 10 }}>
                    <Card.Header accessibilityLabel={`Peça: ${title}. Prossiga para ouvir a dica da parte.`} ref={r => this.nomeDaPeca = r} title={title} />
                    <Card.Body>
                            <Text ref={r => this.dicaDaParte = r} accessibilityLabel={`Dica: ${data[count].texto}. Prossiga para informar ${data[count].valores.length > 1 ? 'os nomes das partes' : 'o nome da parte'}`} style={{ margin: 10, fontSize: 18, textAlign: 'center' }}>{data[count].texto}</Text>
                                {data[count].valores.map((value, idx) => (
                                    <View key={count + '-' + idx}>
                                        <Form
                                            data={data[count]}
                                            timer={timer}
                                            tentativas={tentativas}
                                            maxTentativas={this.props.screenProps.inputConfig.chances}
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
                        <Button  accessibilityLabel={`Próximo. Botão. Toque duas vezes para obter a próxima dica ou prossiga para ouvir as informações extras desta etapa`} style={{ flex: 1, margin: 5, marginBottom: 0 }} onPressOut={onSubmit} type='primary'>Próximo</Button>
                    </Card.Body>
                </Card>

                <Card>
                    <Card.Header title='Resumo' />
                    <Card.Body>
                    <Placar
                                    count={count}
                                    total={total}
                                    tentativas={tentativas}
                                    _maxTentativa={this.props.screenProps.inputConfig.chances}
                                    timer={timer}
                                />
                    </Card.Body>
                </Card>
            </View>
        )
    }
}


export default FormTreLoc;
