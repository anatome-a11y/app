import Button from 'antd-mobile-rn/lib/button';
import Card from 'antd-mobile-rn/lib/card';
import List from 'antd-mobile-rn/lib/list';
import Toast from 'antd-mobile-rn/lib/toast';
import React, { Component } from 'react';
import { Text, View } from 'react-native';
import { announceForAccessibility, focusOnView } from 'react-native-accessibility';
import BC from '../components/Breadcrumbs';
import Input from '../components/Input';
import Instrucoes from '../components/Instrucoes';
import LocalizacaoPD from '../components/LocalizacaoPD';
import Container from '../Container';
import { norm } from '../utils';
import Placar from './Placar';
import Resultados from './Resultados';


class FormContainer extends React.Component {
    initialFocus = null;
    nomeDaPeca = null;
    dicaDaParte = null;
    listRef = null;

    state = {
        found: null,
        pesquisa: ''
    }

    componentDidMount() {
        this.time2Focus = setTimeout(() => {
            focusOnView(this.initialFocus)
        }, 500)
    }

    componentWillReceiveProps(next) {
        const { mainState, screenProps } = this.props;

        //Se mudou a peça física, foco na peça física
        if (mainState.data[mainState.count].pecaFisica.nome != next.mainState.data[next.mainState.count].pecaFisica.nome) {
            this.setState({ found: null, pesquisa: '' }, () => {
                setTimeout(() => {
                    focusOnView(this.nomeDaPeca)
                }, 500);
            })
        } else {
            //Se muou apenas a parte: foco na parte
            if (mainState.count != next.mainState.count) {
                this.setState({ found: null, pesquisa: '' }, () => {
                    setTimeout(() => {
                        focusOnView(this.dicaDaParte)
                    }, 500);
                })
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
        const title = data[count].pecaFisica.nome;
        const { found, pesquisa } = this.state;

        const pecasFisicas = anatomp.pecasFisicas;
        const localizacaoRelativa = data[count].referenciaRelativa.referencia;
        const parte = localizacaoRelativa != null ? localizacaoRelativa : data[count].parte;

        let labelLocalizacaoRelativa;

        if (localizacaoRelativa != null && screenProps.anatomp.tipoPecaMapeamento == 'pecaDigital') {
            Object.keys(pecasFisicas).map(key => {
                let peca = JSON.parse(JSON.stringify(pecasFisicas[key]));
                for (let image of peca.midias) {
                    let pontoFiltrado = image.pontos.filter(ponto => ponto.parte._id == parte._id);
                    if (pontoFiltrado.length > 0) {
                        labelLocalizacaoRelativa = pontoFiltrado[0].label;
                    }
                }
            });
        }

        const identificador = data[count].referenciaRelativa.referencia == null ? ('Nome da parte ' + data[count].numero) : ('Em relação à parte ' + labelLocalizacaoRelativa + ', informe o nome da parte localizada ' + data[count].referenciaRelativa.referenciaParaReferenciado)

        const info = (screenProps.anatomp.tipoPecaMapeamento == 'pecaFisica' ? 'Para cada parte (isto é, sua localização) em cada peça física, selecione o nome da parte e em seguida pressione o botão "Próximo" para submeter' : 'Para cada parte (isto é, sua localização) em cada peça digital, informe o nome da parte e em seguida pressione o botão "Próximo" para submeter.');

        return (
            <View>
                <BC _ref={r => this.initialFocus = r} body={['Roteiros', anatomp.nome]} head={'Treinamento - Prático - Localização-Conteúdo'} />
                <Instrucoes
                    voz={screenProps.config.indexOf('voz') != -1}
                    info={[
                        info,
                        'Utilize o campo "Nome da parte" para informar o nome da parte.',
                        `Você tem ${screenProps.inputConfig.chances} chances para acertar e um tempo máximo de ${screenProps.inputConfig.tempo} segundos.`
                    ]} />
                <Card style={{ marginBottom: 10 }}>
                    <Card.Header ref={r => this.nomeDaPeca = r} accessibilityLabel={`Peça: ${title}. Prossiga para ouvir a parte anatômica`} title={title} />
                    <Card.Body>
                        <View>

                            <Text ref={r => this.dicaDaParte = r} accessibilityLabel={`${identificador}. Prossiga para buscar a parte correspondente.`} style={{ margin: 10, fontSize: 18, textAlign: 'center' }}>{identificador}</Text>


                            {screenProps.anatomp.tipoPecaMapeamento == 'pecaDigital' &&
                                <LocalizacaoPD parte={parte} pecasFisicas={pecasFisicas} exibirLabel={true} mapa={screenProps.anatomp.mapa} />
                            }

                            <Input
                                _ref={onGetRef(count)}
                                value={this.state.pesquisa}
                                onChange={this.onFind}
                                name={'Nome da parte'}
                                onDone={onSubmit}
                            />
                            {!found || pesquisa == '' && <Text style={{ padding: 5 }}>Nenhuma parte foi identificada</Text>}
                        </View>
                        <Button accessibilityLabel={`Próximo. Botão. Toque duas vezes para obter a próxima dica ou prossiga para ouvir as informações extras desta etapa`} style={{ flex: 1, margin: 5, marginBottom: 0 }} onPressOut={onSubmit} type='primary'>Próximo</Button>
                    </Card.Body>
                </Card>

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
            const found = this.props.mainState.partes.find(c => {
                return norm(c.nome) == norm(this.state.pesquisa)
            });

            if (found) {
                this.onChange(found);
            } else {
                announceForAccessibility(`Parte não encontrada`)
            }

            this.setState({ found })
        })
    }


    onChange = parte => {
        this.props.onChangeValor(parte)
        announceForAccessibility(`${parte.nome} selecionado`)
    }
}



const ListItem = List.Item;

const _ni = 'Não identificado'

class PraTreNom extends Component {
    timer = null;
    fieldRef = []

    state = {
        data: [],
        count: 0,
        total: 0,
        timer: 60,
        maxTime: 60,
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
            mapa.localizacao.map(loc => pecasFisicas[loc.pecaFisica._id].partesNumeradas.push({ parte: mapa.parte, numero: loc.numero, referenciaRelativa: loc.referenciaRelativa }))
        })


        let flatData = [];

        Object.keys(pecasFisicas).forEach(key => {
            const { partesNumeradas, pf } = pecasFisicas[key];
            partesNumeradas.forEach(pn => {
                flatData = [...flatData, { ...pn, pecaFisica: pf }]
            })
        })


        const dados = flatData.map(fd => ({ ...fd, acertou: false, valores: [''] }));

        const timer = this.getMaxQuestionTime(dados[this.state.count]);

        this.fieldRef = flatData.map(fd => [null])

        this.setState({ loading: false, data: dados, timer: timer, maxTime: timer, total: dados.length, partes: anatomp.roteiro.partes }, () => {
            this.onCount();
            Toast.hide();
        })

    }

    getMaxQuestionTime(obj) {
        const texto = obj.parte.nome;

        const writeTime = texto.length * this.getConfigs().tempoDigitacaoPorCaractere;
        const speakTime = texto.length * this.getConfigs().tempoFalaPorCaractere;

        const responseTime = this.props.screenProps.config.includes('voz') ? speakTime : writeTime;

        const totalTime = this.getConfigs().tempoBase + responseTime;
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
        const { data, count, loading } = this.state;

        const _View = loading ? null : (
            count < data.length ? (
                <FormContainer
                    screenProps={screenProps}
                    mainState={this.state}
                    onGetRef={this.onGetRef}
                    onChangeValor={this.onChangeValor}
                    onSubmit={this.onSubmit}
                    maxTentativa={this.props.screenProps.inputConfig.chances}
                />
            ) : <Resultados bc={['Roteiros', screenProps.anatomp.nome, 'Treinamento - Prático - Localização-Conteúdo']} data={data} onRepeat={this.onRepeat} formatter={e => `Numero ${e.numero}, peça ${e.pecaFisica.nome}`} />
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
                    Toast.fail(msg, 3, () => this.onSetFocus(count))
                    announceForAccessibility(msg)
                }
            }
        } else {
            this.onNext(false)()
        }
    }


    onNext = acertou => () => {
        const { data, count, tentativas, timer } = this.state;
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