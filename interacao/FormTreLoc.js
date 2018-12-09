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

import Imagens from '../components/Imagens'
import Videos from '../components/Videos'


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



const DicaTeoria = ({ config, atual, _ref }) => {
    const refRel = atual.partes.filter(p => p.referenciaRelativa.referencia != null);
    const qtdRefRel = refRel.length;
    const titleRefRel = 'Atente-se para as referências relativas:';
    const instrucao = "Selecione a parte localizada ";

    return (
        <View ref={_ref}>
            <View style={{ margin: 10 }}>
                <Text style={{textAlign: 'justify'}}>{atual.texto}</Text>
                {qtdRefRel > 0 && (
                    atual.partes.length > 1 ? (
                        <View>
                            <Text style={{textAlign: 'justify'}}>{titleRefRel}</Text>
                            {refRel.map((p, key) => <Text style={{textAlign: 'justify', paddingLeft: 10}} key={key}>{'- '+instrucao + p.referenciaRelativa.referenciadoParaReferencia}</Text>)}
                        </View>
                    ) : (
                        <Text style={{textAlign: 'justify'}}>{instrucao + atual.partes[0].referenciaRelativa.referenciadoParaReferencia}</Text> 
                    )
                )}
            </View>
            <Imagens config={config} midias={atual.midias} />
            <Videos config={config} midias={atual.midias} />
        </View>
    )
}


const DicaPratica = ({ atual, _ref, dica }) => {
    const identificador = (!atual.referenciaRelativa || atual.referenciaRelativa.referencia == null) ? atual.texto : (atual.texto + ': Selecione a parte localizada ' + atual.referenciaRelativa.referenciadoParaReferencia)
    return (
        <View accessible={true} ref={_ref} accessibilityLabel={`Dica: ${identificador}. Prossiga para informar ${dica}`}>
             <Text style={{ margin: 10, fontSize: 18, textAlign: 'center' }}>{identificador}</Text>               
        </View>        
    )
}


class FormTreLoc extends React.Component {

    nomeDaPeca = null;
    dicaDaParte = null;
    initialFocus = null;
    btnProximo = null;

    componentDidMount() {
        this.time2Focus = setTimeout(() => {
            focusOnView(this.initialFocus)
        }, 500)
    }

    componentWillReceiveProps(next) {
        const { mainState, onSetSinalScroll, sinalTexto } = this.props;

        //Se mudou a peça física, foco na peça física
        if (mainState.data[mainState.count].pecaFisica.nome != next.mainState.data[next.mainState.count].pecaFisica.nome) {
            onSetSinalScroll(+ new Date())
            setTimeout(() => {
                focusOnView(this.nomeDaPeca)
            }, 500)
        } else {
            //Se muou apenas a parte: foco na parte
            if (mainState.count != next.mainState.count) {
                onSetSinalScroll(+ new Date())
                setTimeout(() => {
                    focusOnView(this.dicaDaParte)
                }, 500)
            }
        }

        // if (sinalTexto != next.sinalTexto) {
        //     onSetSinalScroll(+ new Date(), () => {
        //         setTimeout(() => {
        //             focusOnView(this.dicaDaParte)
        //         }, 500)            
        //     })
        // }


        if (this.props.mainState.timer != 0 && next.mainState.timer == 0) {
            if (next.mainState.count !== next.mainState.data.length) {
                setTimeout(() => {
                    focusOnView(this.btnProximo)
                }, 1500)
            }
        }
    }

    componentWillUnmount() {
        clearInterval(this.time2Focus)
    }


    render() {
        const { screenProps, mainState, onGetRef, onSetFocus, onChangeValor, onErrorClick, onSubmit, interaction, info, isTeoria } = this.props;
        const { anatomp, onReadNFC, onStopNFC, config } = screenProps;
        const { count, total, data, timer, pecasFisicas, tentativas } = mainState;
        const title = data[count].pecaFisica.nome;
        const dica = data[count].valores.length > 1 ? 'as partes' : 'a parte';

        return (
            <View>
                <BC _ref={r => this.initialFocus = r} body={['Roteiros', anatomp.nome]} head={interaction} />
                <Instrucoes voz={screenProps.config.indexOf('voz') != -1} info={info} />
                <Card style={{ marginBottom: 10 }}>
                    <Card.Header accessibilityLabel={`Peça: ${title}. Prossiga para ouvir a dica d${dica}.`} ref={r => this.nomeDaPeca = r} title={title} />
                    <Card.Body>
                        {isTeoria ? <DicaTeoria _ref={r => this.dicaDaParte = r} atual={data[count]} config={config} /> : <DicaPratica dica={dica} _ref={r => this.dicaDaParte = r} atual={data[count]} />}                        
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
                        <Button ref={r => this.btnProximo = r} accessibilityLabel={`Próximo. Botão. Toque duas vezes para obter a próxima dica ou prossiga para ouvir as informações extras desta etapa`} style={{ flex: 1, margin: 5, marginBottom: 0 }} onPressOut={onSubmit} type='primary'>Próximo</Button>
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
