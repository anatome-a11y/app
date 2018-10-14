import React, { Component } from 'react';

import Container from '../Container';
import Toast from 'antd-mobile-rn/lib/toast';

import { announceForAccessibility, focusOnView } from 'react-native-accessibility';

import Resultados from './Resultados'
import FormTreLoc from './FormTreLoc'

class PraTreloc extends Component {
    timer = null;
    fieldRef = []

    state = {
        data: [],
        count: 0,
        total: 0,
        timer: this.props.screenProps.inputConfig.tempo,
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

        let dados = []

        Object.keys(pecasFisicas).forEach(key => {
            const { nome, _id } = pecasFisicas[key];

            pecasFisicas[key].partesNumeradas.forEach(pn => {
                const texto = pn.parte.nome;

                dados.push({ pecaFisica: { nome, _id }, texto, modo: 'singular', partes: [pn], acertou: false, valores: [''] })
            })

        })

        this.fieldRef = dados.map(fd => Array(1).fill(null))

        this.setState({ data: dados, total: dados.length, pecasFisicas: { ...pecasFisicas } }, () => {
            this.onCount();
            this.onSetFocus(0)
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
        const { data, count } = this.state;


        return (
            <Container navigation={navigation}>
                {count < data.length ? (
                    <FormTreLoc
                        screenProps={screenProps}
                        mainState={this.state}
                        onGetRef={this.onGetRef}
                        onSetFocus={this.onSetFocus}
                        onChangeValor={this.onChangeValor}
                        onErrorClick={this.onErrorClick}
                        onSubmit={this.onSubmit}
                        interaction='Treinamento-Prático-Localizar'
                        info={[
                            'Informe as partes de cada peça física do roteiro e pressione o botão "Próximo" para submeter.',
                            `Você tem ${screenProps.inputConfig.chances} chances para acertar e um tempo máximo de ${screenProps.inputConfig.tempo} segundos.`
                        ]}
                    />
                ) : <Resultados data={data} onRepeat={this.onRepeat} formatter={e => e.texto} />}
            </Container>
        )
    }

    onRepeat = () => {
        const { data } = this.state;
        const dados = data.map(fd => ({ ...fd, acertou: false, valores: fd.modo == 'singular' ? Array(1).fill('') : Array(fd.partes.length).fill('') }));

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

        if(timer > 0){
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
                    const msg = `Resposta incorreta. Você tem mais ${num} tentativa${num == 1 ? '' : 's'}`
                    Toast.fail(msg, 3, () => this.onSetFocus(count))
                    announceForAccessibility(msg)
                }
            }            
        }else{
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
            if (count + 1 < data.length) {
                this.onSetFocus(count + 1)
            }

        })

    }

    onGetRef = (count, idx) => r => { this.fieldRef[count][idx] = r }

    onSetFocus = (count, idx = 0) => {
        const { config } = this.props.screenProps;
        if (config.indexOf('talkback') !== -1) {
            focusOnView(this.fieldRef[count][idx])
        }else{
            if (config.indexOf('nfc') == -1 && config.indexOf('voz') == -1) {
                this.fieldRef[count][idx].focus()
            }            
        }        
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

export default PraTreloc;