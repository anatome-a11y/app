import Toast from 'antd-mobile-rn/lib/toast';
import React, { Component } from 'react';
import { announceForAccessibility, focusOnView } from 'react-native-accessibility';
import Container from '../Container';
import FormTreLoc from './FormTreLoc';
import Resultados from './Resultados';





class PraTreloc extends Component {
    timer = null;
    fieldRef = []

    state = {
        data: [],
        count: 0,
        total: 0,
        timer: 60,
        maxTime: 60,
        pecasFisicas: [],
        tentativas: 0,
        sinalScroll: 0,
        sinalTexto: 0
    }

    // Componente iniciliazado
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
                pecasFisicas[loc.pecaFisica._id].partesNumeradas.push({ parte: mapa.parte, numero: loc.numero, referenciaRelativa: loc.referenciaRelativa })
            })
        })

        let dados = []

        Object.keys(pecasFisicas).forEach(key => {
            const { nome, _id } = pecasFisicas[key];

            pecasFisicas[key].partesNumeradas.forEach(pn => {
                const texto = pn.parte.nome;

                dados.push({ pecaFisica: { nome, _id }, referenciaRelativa: pn.referenciaRelativa, texto, modo: 'singular', partes: [pn], acertou: false, valores: [''] })
            })

        })

        this.fieldRef = dados.map(fd => Array(1).fill(null))

        // Obter o tempo máximo para requestão inicial
        const timer = this.getMaxQuestionTime(dados[this.state.count]);

        // O tempo máximo é definido em `timer` e `maxTime`
        // `timer`: Tempo restante atualmente (reduz a cada um segundo)
        // `maxTime`: Tempo máximo para a questão atual
        this.setState({ data: dados, timer: timer, maxTime: timer, total: dados.length, pecasFisicas: { ...pecasFisicas } }, () => {
            this.onCount();
            Toast.hide();
        })

    }

    // Calcula o tempo da questão
    getMaxQuestionTime(obj) {
        // Obtem o nome da peça
        const nome = obj.partes[0].parte.nome;
        const readTime = nome.length * this.getConfigs().tempoLeituraPorCaractere;

        const totalTime = this.getConfigs().tempoBase + readTime;
        return Math.ceil(totalTime);
    }

    getConfigs() {
        return this.props.screenProps.inputConfig;
    }

    componentWillUpdate(nextProps, nextState) {
        if (this.state.timer != 0 && nextState.timer <= 0) {
            clearInterval(this.timer)
            if (nextState.count !== nextState.data.length) {
                Toast.info('Tempo limite excedido!')
                announceForAccessibility('Tempo limite excedido!')
            }
        }
    }

    componentWillUnmount() {
        clearInterval(this.timer)
    }

    render() {
        const { navigation, screenProps } = this.props;
        const { data, count, sinalScroll, sinalTexto } = this.state;
        const info = (screenProps.anatomp.tipoPecaMapeamento == 'pecaFisica' ? 'Informe as partes de cada peça física do roteiro e pressione o botão "Próximo" para submeter.' : 'Clique nas partes de cada peça digital do roteiro.');

        return (
            <Container sinalScroll={sinalScroll} navigation={navigation}>
                {count < data.length ? (
                    <FormTreLoc
                        sinalTexto={sinalTexto}
                        onSetSinalScroll={s => this.setState({ sinalScroll: s })}
                        screenProps={screenProps}
                        mainState={this.state}
                        onGetRef={this.onGetRef}
                        onSetFocus={this.onSetFocus}
                        onChangeValor={this.onChangeValor}
                        onChangeValorDigital={this.onChangeValorDigital}
                        onErrorClick={this.onErrorClick}
                        onSubmit={this.onSubmit}
                        interaction='Treinamento - Prático - Conteúdo-Localização'
                        info={[
                            info,
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

        // Reseta o tempo máximo ao repetir a tentativa para a questão
        this.setState({
            data: dados,
            count: 0,
            timer: this.state.maxTime,
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
                    const msg = `Resposta incorreta. Você tem mais ${num} tentativa${num == 1 ? '' : 's'}`
                    Toast.fail(msg, 3, () => this.setState({ sinalTexto: + new Date() }))
                    announceForAccessibility(msg)
                }
            }
        } else {
            this.onNext(false)()
        }

    }


    onNext = acertou => () => {
        const { data, count, tentativas, timer } = this.state;

        // Ao ir para a próxima questão, calcular o novo tempo
        let newTimer = timer;

        if(count < data.length - 1) {
            newTimer = this.getMaxQuestionTime(data[count + 1])
        }

        this.setState({
            count: count + 1,
            timer: newTimer,
            maxTime: newTimer,
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
            if (this.props.screenProps.anatomp.tipoPecaMapeamento == 'pecaFisica' && count + 1 < data.length) {
                this.onSetFocus(count + 1)
            }

        })

    }

    onGetRef = (count, idx) => r => { this.fieldRef[count][idx] = r }

    onSetFocus = (count, idx = 0) => {
        const { config } = this.props.screenProps;
        if (config.indexOf('talkback') !== -1) {
            focusOnView(this.fieldRef[count][idx])
        } else {
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

        if (valor) {
            announceForAccessibility(`Texto detectado: ${valor}. Prossiga para submeter.`)
        } else {
            announceForAccessibility(`Texto removido`)
        }

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

    onChangeValorDigital = async (idx, valor) => {
        const { data, count } = this.state;

        if (valor) {
            announceForAccessibility(`Texto detectado: ${valor}. Prossiga para submeter.`)
        } else {
            announceForAccessibility(`Texto removido`)
        }

        await this.setState({
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
        });

        this.onSubmit();
    }
}

export default PraTreloc;