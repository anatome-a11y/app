import Toast from 'antd-mobile-rn/lib/toast';
import React, { Component } from 'react';
import { announceForAccessibility, focusOnView } from 'react-native-accessibility';
import Container from '../Container';
import FormTreLoc from './FormTreLoc';
import Resultados from './Resultados';


class TeoTreLoc extends Component {
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

        let flatData = []

        //Itera em cada conteudo e o vincula às peças fisicas
        anatomp.roteiro.conteudos.forEach(conteudo => {
            //Busca as peças fisicas que contem o conteudo
            Object.keys(pecasFisicas).forEach(key => {
                const pfTemAParteDoConteudo = pecasFisicas[key].partesNumeradas.find(pn => conteudo.partes.find(p => p._id == pn.parte._id) != undefined)

                if (pfTemAParteDoConteudo) {
                    const { nome, _id } = pecasFisicas[key];
                    //Substitui as partes do conteudo por partes numeradas
                    const partes = pecasFisicas[key].partesNumeradas.filter(pn => conteudo.partes.find(p => p._id == pn.parte._id) != undefined);

                    if (conteudo.plural != '') {
                        flatData.push({ pecaFisica: { nome, _id }, modo: 'plural', texto: conteudo.plural, partes, midias: conteudo.midias })
                    } else {
                        if (conteudo.singular != '') {
                            flatData.push({ pecaFisica: { nome, _id }, modo: 'singular', texto: conteudo.singular, partes, midias: conteudo.midias })
                        }
                    }
                }
            })
        })

        const dados = flatData.map(fd => ({ ...fd, acertou: false, valores: fd.modo == 'singular' ? Array(1).fill('') : Array(fd.partes.length).fill('') }));

        this.fieldRef = flatData.map(fd => fd.modo == 'singular' ? Array(1).fill(null) : Array(fd.partes.length).fill(null))

        const timer = this.getMaxQuestionTime(dados[this.state.count]);

        this.setState({ data: dados, timer: timer, maxTime: timer, total: dados.length, pecasFisicas: { ...pecasFisicas } }, () => {
            this.onCount();
            Toast.hide();
        })

    }

    getMaxQuestionTime(obj) {
        const readTime = obj.texto.length * this.getConfigs().tempoLeituraPorCaractere;

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
        const info = (screenProps.anatomp.tipoPecaMapeamento == 'pecaFisica' ? 'Para cada conteúdo teórico informe a parte correspondente e em seguida pressione o botão "Próximo" para submeter.' : 'Para cada conteúdo teórico clique na parte correspondente.');

        return (
            <Container sinalScroll={sinalScroll} navigation={navigation} >
                {count < data.length ? (
                    <FormTreLoc
                        screenProps={screenProps}
                        sinalTexto={sinalTexto}
                        onSetSinalScroll={this.onSetSinalScroll}
                        mainState={this.state}
                        onGetRef={this.onGetRef}
                        onSetFocus={this.onSetFocus}
                        onChangeValor={this.onChangeValor}
                        onChangeValorDigital={this.onChangeValorDigital}
                        onErrorClick={this.onErrorClick}
                        onSubmit={this.onSubmit}
                        interaction='Treinamento - Teórico - Conteúdo-Localização'
                        isTeoria={true}
                        info={[
                            info,
                            `Você tem ${screenProps.inputConfig.chances} chances para acertar e um tempo máximo de ${screenProps.inputConfig.tempo} segundos.`
                        ]}
                    />
                ) : <Resultados data={data} onRepeat={this.onRepeat} formatter={e => e.texto} />}
            </Container>
        )
    }

    onSetSinalScroll = (s, cb) => this.setState({ sinalScroll: s }, cb)

    onRepeat = () => {
        const { data } = this.state;
        const dados = data.map(fd => ({ ...fd, acertou: false, valores: fd.modo == 'singular' ? Array(1).fill('') : Array(fd.partes.length).fill('') }));

        clearInterval(this.timer)

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
        const { config } = this.props.screenProps;

        let newTimer = timer;

        if (count < data.length - 1) {
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
                if (config.indexOf('talkback') == -1) {
                    if (config.indexOf('nfc') == -1 && config.indexOf('voz') == -1) {
                        this.fieldRef[count + 1][0].focus()
                    }
                }
            }

        })


    }

    onGetRef = (count, idx) => r => { this.fieldRef[count][idx] = r }

    onSetFocus = (count, idx = 0) => {
        const { config } = this.props.screenProps;
        if (config.indexOf('talkback') !== -1) {
            focusOnView(this.fieldRef[count][idx]);
        } else {
            if (config.indexOf('nfc') == -1 && config.indexOf('voz') == -1) {
                this.fieldRef[count][idx].focus()
            }
        }
    }

    checkAcertos = item => {

        const { pecasFisicas } = this.state;

        // Verifica se informou Parte Relativa
        if (this.props.screenProps.anatomp.tipoPecaMapeamento == 'pecaDigital') {
            var verificaRefrenciaRelativa = false;
            item.partes.forEach(parte => {
                if (parte.referenciaRelativa.referencia != null) {
                    Object.keys(pecasFisicas).forEach(key => {
                        const partesNumeradas = pecasFisicas[key].partesNumeradas;
                        var pn = partesNumeradas.find(pn => pn.parte._id == parte.referenciaRelativa.referencia._id)
                        if (pn != undefined) {
                            verificaRefrenciaRelativa = pn.numero == item.valores[0];
                            if (verificaRefrenciaRelativa) {
                                return true;
                            }
                        }
                    });
                }
            });
            if (verificaRefrenciaRelativa) {
                return true;
            }
        }

        if (item.modo == 'singular') {
            return item.partes.find(p => p.numero == item.valores[0]) != undefined
        } else {
            if (this.props.screenProps.anatomp.tipoPecaMapeamento == 'pecaDigital') {
                return item.partes.find(p => p.numero == item.valores[0]) != undefined
            } else {
                return item.partes.every(p => item.valores.indexOf(p.numero) != -1)
            }
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
        const { data, count, timer } = this.state;

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
        })

        this.onSubmit();
    }
}

export default TeoTreLoc;