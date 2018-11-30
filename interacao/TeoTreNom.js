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
import Modal from '../components/Modal'
import {Simple as Option} from '../components/Option'

import { norm } from '../utils'

import BC from '../components/Breadcrumbs'
import Instrucoes from '../components/Instrucoes'


class FormContainer extends React.Component {
    initialFocus = null;
    nomeDaPeca = null;
    dicaDaParte = null;
    listRef = null;

    state = {
        open: false
    }

    componentDidMount() {
        this.time2Focus = setTimeout(() => {
            focusOnView(this.initialFocus)
        }, 500)
    }

    componentWillReceiveProps(next) {
        const { mainState, screenProps } = this.props;
        //Se mudou a peça física, foco na peça física
        if (mainState.data[mainState.count].localizacao.pecaFisica.nome != next.mainState.data[next.mainState.count].localizacao.pecaFisica.nome) {
            setTimeout(() => {
                focusOnView(this.nomeDaPeca)
            }, 1000);
        } else {
            //Se muou apenas a parte: foco na parte
            if (mainState.count != next.mainState.count) {
                setTimeout(() => {
                    focusOnView(this.dicaDaParte)
                }, 1000);
            }
        }

    }

    componentWillUnmount() {
        clearInterval(this.time2Focus)
    }


    render() {
        const { screenProps, mainState, onGetRef, maxTentativa, onChange } = this.props;
        const { anatomp, config } = screenProps;
        const { count, total, data, timer, tentativas } = mainState;
        const title = data[count].localizacao.pecaFisica.nome;
        const identificador = 'Parte ' + data[count].localizacao.numero;
        const { open } = this.state;
        const isTB = config.indexOf('talkback') != -1;

        const disabled = data[count].respostaParte.length == 0 || data[count].respostaConteudos.length == 0;
        const disabledVerificacao = timer == 0 || tentativas == maxTentativa;


        const dialogButton = isTB ? { 
            text: 'Fechar', 
            onPress: this.toggleDialog(false), 
            acc: `Fechar. Botão. Toque duas vezes para fechar a verificação de respostas.`
         } : { 
            text: 'Próximo', 
            onPress: this.onSubmit, 
            acc: `Próximo. Botão. Toque duas vezes para submeter ir para a próxima parte`
         }
        return (
            <View>
                <BC _ref={r => this.initialFocus = r} body={['Roteiros', anatomp.nome]} head={'Treinamento-Prático-Nomear'} />
                <Instrucoes info={[
                    'Dada a localização de cada parte, informe o seu nome e seus respectivos conteúdos teóricos',
                    'Após informar estes dados, verifique quais você acertou',
                    `Você tem ${screenProps.inputConfig.chances} chances para acertar e um tempo máximo de ${screenProps.inputConfig.tempo} segundos.`
                ]} />
                <Card style={{ marginBottom: 10 }}>
                    <Card.Header ref={r => this.nomeDaPeca = r} accessibilityLabel={`Peça: ${title}. Prossiga para ouvir a parte anatômica`} title={title} />
                    <Card.Body>
                        <View>
                            <Text ref={r => this.dicaDaParte = r} accessibilityLabel={`${identificador}. Prossiga para informar o nome da parte correspondente.`} style={{ margin: 10, fontSize: 18, textAlign: 'center' }}>{identificador}</Text>
                            <Input
                                _ref={onGetRef(count)}
                                value={data[count].respostaParte}
                                onChange={onChange('respostaParte')}
                                name={'Nome da parte'}
                                InputProps={{
                                    disabled: timer <= 0
                                }}
                            />
                            <Input
                                isTextArea={true}
                                value={data[count].respostaConteudos}
                                onChange={onChange('respostaConteudos')}
                                name={'Conteudos teóricos'}
                                InputProps={{
                                    editable: timer > 0
                                }}
                            />
                        </View>
                        <Button disabled={disabled || disabledVerificacao} accessibilityLabel={(disabled || disabledVerificacao) ? 'Verificar Respostas. Botão. Desabilitado' :`Verificar respostas. Botão. Toque duas vezes para abrir a verficação de respostas`} style={{ flex: 1, margin: 5, marginBottom: 0 }} onPressOut={this.toggleDialog(true)} type='primary'>Verificar respostas</Button>
                        {isTB && <Button disabled={disabled} accessibilityLabel={disabled ? 'Próximo. Botão. Desabilitado' :`Próximo. Botão. Toque duas vezes para confirmar suas respostas`} style={{ flex: 1, margin: 5, marginBottom: 0 }} onPressOut={this.onSubmit} type='primary'>Próximo</Button>}
                    </Card.Body>
                </Card>
                <Modal
                    talkback={isTB}
                    open={open}
                    title={identificador}
                    acc={`${identificador}. Aberto. Prossiga para ouvir as informações da parte`}
                    footer={[dialogButton]}
                >
                    <View accessible={true}>
                        <Text style={{ fontWeight: 'bold', color: '#000', marginBottom: 3 }}>Sua resposta:</Text>
                        <Text>{data[count].respostaParte}</Text>
                        <Text>{data[count].respostaConteudos}</Text>
                        <Text accessibilityLabel='Prossiga para ouvir a lista de respostas esperadas'></Text>
                    </View>
                    <Text accessibilityLabel={`Respostas esperadas. ${data[count].conteudos.length+1} itens na lista. Prossiga para marcar as opções que você acertou.`} accessible style={{ color: '#000', marginBottom: 3, marginTop: 6 }}><Text style={{ fontWeight: 'bold' }}>Respostas esperadas </Text>(Marque o que você acertou):</Text>
                    <List>
                        <List.Item>
                            <Option
                                label={`Parte. ${data[count].parte.nome}`}
                                checked={data[count].correcao[0]}
                                onChange={this.onChangeCorrecao(0)}
                                title={data[count].parte.nome}
                            />
                        </List.Item>
                        {data[count].conteudos.map((c, idx) => (
                            <List.Item key={idx}>
                                <Option
                                    label={c}
                                    checked={data[count].correcao[idx + 1]}
                                    onChange={this.onChangeCorrecao(idx + 1)}
                                    title={c}
                                />
                            </List.Item>
                        ))}
                    </List>
                </Modal>
                <Card>
                    <Card.Header title='Resumo' />
                    <Card.Body>
                        <Placar
                            count={count}
                            total={total}
                            tentativas={tentativas}
                            _maxTentativa={this.props.maxTentativa}
                            timer={timer}
                        />
                    </Card.Body>
                </Card>
            </View>
        )
    }


    toggleDialog = open => () => this.setState({ open })

    onSubmit = () => {
        this.setState({ open: false }, this.props.onSubmit)
    }

    onChangeCorrecao = idx => () => {
        const { data, count } = this.props.mainState
        announceForAccessibility(data[count].correcao[idx] ? `Seleção removida` : 'Selecionado!')
        this.props.onChange('correcao')([
            ...data[count].correcao.slice(0, idx),
            !data[count].correcao[idx],
            ...data[count].correcao.slice(idx + 1),
        ])
    }
}



const ListItem = List.Item;

const _ni = 'Não identificado'

class TeoTreNom extends Component {
    timer = null;
    fieldRef = []

    state = {
        data: [],
        count: 0,
        total: 0,
        timer: this.props.screenProps.inputConfig.tempo,
        tentativas: 0,
        loading: true
    }

    componentDidMount() {
        const { anatomp } = this.props.screenProps;

        Toast.loading('Aguarde...', 0)
        announceForAccessibility('Aguarde...')

        //Objeto de indexação
        let partesUnificadas = {};
        anatomp.roteiro.conteudos.forEach(c => {
            if (c.partes.length == 1) {
                const { _id } = c.partes[0];
                if (partesUnificadas[_id]) {
                    partesUnificadas[_id].conteudos.push(c.singular)
                    partesUnificadas[_id].correcao.push(false)
                } else {
                    const itemMapa = anatomp.mapa.find(m => m.parte._id == _id);
                    partesUnificadas[_id] = { parte: c.partes[0], localizacao: itemMapa.localizacao[0], conteudos: [c.singular], respostaParte: '', respostaConteudos: '', acertou: false, correcao: [false, false] }
                }
            }
        });

        const array = Object.keys(partesUnificadas).map(key => partesUnificadas[key]);

        this.fieldRef = array.map(fd => [null])

        this.setState({ loading: false, data: array, total: array.length }, () => {
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
            this.setState({ timer: this.props.screenProps.inputConfig.tempo });
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
                    onChange={this.onChange}
                    onSubmit={this.onSubmit}
                    maxTentativa={this.props.screenProps.inputConfig.chances}
                />
            ) : <Resultados bc={['Roteiros', screenProps.anatomp.nome, 'Treinamento-Teórico-Nomear']} data={data} onRepeat={this.onRepeat} formatter={e => `Numero ${e.localizacao.numero}, peça ${e.localizacao.pecaFisica.nome}`} />
        )

        return (
            <Container navigation={navigation}>
                {_View}
            </Container>
        )
    }

    onRepeat = () => {
        const { data } = this.state;
        const dados = data.map(fd => ({ ...fd, acertou: false, respostaConteudos: '', respostaParte: '', correcao: Array(fd.conteudos.length + 1).fill(false) }));

        clearInterval(this.timer)

        this.setState({
            data: dados,
            count: 0,
            timer: this.props.screenProps.inputConfig.tempo,
            tentativas: 0
        }, () => this.onCount())
    }

    onErrorClick = () => { Toast.info('Parte não registrada'); announceForAccessibility('Parte não registrada') }

    onSubmit = () => {
        const { data, count, tentativas, timer } = this.state;

        let acertou = this.checkAcertos(data[count]);

        if (timer > 0) {
            if (acertou) {
                Toast.success('Acertou!', 3, this.onNext(acertou));
                announceForAccessibility('Acertou!')
            } else {
                this.setState({ tentativas: tentativas + 1 })
                if (tentativas == this.props.screenProps.inputConfig.chances - 1) {
                    Toast.fail('Você errou.', 3, this.onNext(acertou))
                    announceForAccessibility('Você errou.')
                } else {
                    const num = this.props.screenProps.inputConfig.chances - tentativas - 1;
                    const msg = `Corrija ou complemente sua resposta. Você tem mais ${num} tentativa${num == 1 ? '' : 's'}`
                    Toast.fail(msg, 3, () => this.onSetFocus(count))
                    announceForAccessibility(msg)
                }
            }
        } else {
            this.onNext(false)()
        }
    }


    onNext = acertou => () => {
        const { data, count, tentativas } = this.state;

        this.setState({
            count: count + 1,
            timer: this.props.screenProps.inputConfig.tempo,
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
        if (config.indexOf('talkback') != -1) {
            setTimeout(() => focusOnView(this.fieldRef[count]), 500)
        } else {
            if (config.indexOf('nfc') == -1 && config.indexOf('voz') == -1) {
                this.fieldRef[count].focus()
            }
        }

    }

    checkAcertos = item => {
        return item.correcao.every(i => i === true)
    }

    onCount = () => {
        this.timer = setInterval(() => {
            this.setState({ timer: this.state.timer - 1 })
        }, 1000);
    }

    onChange = field => value => {
        const { data, count, timer } = this.state;


        this.setState({
            data: [
                ...data.slice(0, count),
                {
                    ...data[count],
                    [field]: value
                },
                ...data.slice(count + 1),
            ]
        })
    }
}

export default TeoTreNom;