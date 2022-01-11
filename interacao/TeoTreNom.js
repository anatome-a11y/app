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
import Modal from '../components/Modal';
import { Simple as Option } from '../components/Option';
import Container from '../Container';
import { withI18n } from '../messages/withI18n';
import Placar from './Placar';
import Resultados from './Resultados';

/**
 * Esse arquivo é utilizado na função:
 *  > Treinamento
 *  > Teórico
 *  > Localização - Conteúdo
 * 
 * 
 * Verificar se é voz:
 * 
 * config.indexOf('voz')
 * 
 * 
 * 
 * 
 * Obter configurações definidas:
 * 
 * Tempo de base por questão:
 * this.getConfigs().tempoBase
 * 
 * Tempo de leitura por caractere:
 * this.getConfigs().tempoLeituraPorCaractere
 * 
 * Tempo de digitação por caractere:
 * this.getConfigs().tempoDigitacaoPorCaractere
 * 
 * Tempo de fala por caractere:
 * this.getConfigs().tempoFalaPorCaractere
 * 
 * 
 */

class _FormContainer extends React.Component {
    initialFocus = null;
    nomeDaPeca = null;
    dicaDaParte = null;
    listRef = null;


    componentDidMount() {
        const { mainState } = this.props;

        // Randomizar a ordem das partes
        mainState.data.sort(() => (Math.random() > .5) ? 1 : -1);

        this.time2Focus = setTimeout(() => {
            focusOnView(this.initialFocus)
        }, 500)
    }

    componentWillReceiveProps(next) {
        const { mainState, screenProps, onSetSinalScroll } = this.props;
        //Se mudou a peça física, foco na peça física
        if (mainState.data[mainState.count].localizacao.pecaFisica.nome != next.mainState.data[next.mainState.count].localizacao.pecaFisica.nome) {
            onSetSinalScroll()
            setTimeout(() => {
                focusOnView(this.nomeDaPeca)
            }, 500);
        } else {
            //Se muou apenas a parte: foco na parte
            if (mainState.count != next.mainState.count) {
                onSetSinalScroll()
                setTimeout(() => {
                    focusOnView(this.dicaDaParte)
                }, 500);
            }
        }
    }

    componentWillUnmount() {
        clearInterval(this.time2Focus)
    }


    render() {
        const { screenProps, mainState, onGetRef, maxTentativa, onChange, i18n, } = this.props;
        const { anatomp, config } = screenProps;
        const { count, total, data, timer, tentativas, open } = mainState;

        const localizacao = data[count].localizacao;
        const localizacaoRelativa = localizacao.referenciaRelativa.referencia;

        const pecasFisicas = anatomp.pecasFisicas;
        const title = data[count].localizacao.pecaFisica.nome;
        const parte = localizacaoRelativa != null ? localizacaoRelativa : data[count].parte;
        //  const identificador = screenProps.anatomp.tipoPecaMapeamento == 'pecaFisica' ? (data[count].localizacao.referenciaRelativa.referencia == null ? (i18n('common.part') + ' ' + data[count].localizacao.numero) : (i18n('teoTreNom.common.inRelationToThePart') + data[count].localizacao.numero + ', ' + i18n('teoTreNom.common.isLocatedAt') + ' ' + data[count].localizacao.referenciaRelativa.referenciaParaReferenciado)) : (data[count].localizacao.referenciaRelativa.referencia == null ? (i18n('common.part') + ' ' + data[count].localizacao.numero) : (i18n('teoTreNom.common.inRelationToThePart') + ' informada na imagem, ' + i18n('teoTreNom.common.isLocatedAt') + ' ' + data[count].localizacao.referenciaRelativa.referenciaParaReferenciado));


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

        const identificador = data[count].localizacao.referenciaRelativa.referencia == null ? (i18n('common.part') + ' ' + data[count].localizacao.numero) : (i18n('teoTreNom.common.inRelationToThePart') + labelLocalizacaoRelativa + ', ' + i18n('teoTreNom.common.isLocatedAt') + ' ' + data[count].localizacao.referenciaRelativa.referenciaParaReferenciado);

        const isTB = config.indexOf('talkback') != -1;

        const disabled = data[count].respostaParte.length == 0 || data[count].respostaConteudos.length == 0;
        const disabledVerificacao = timer == 0 || tentativas == maxTentativa;


        return (
            <View>
                <BC _ref={r => this.initialFocus = r} body={[i18n('common.scripts'), anatomp.nome]} head={`${i18n('common.training')} - ${i18n('common.theoretical')} - ${i18n('common.locToContent')}`} />
                <Instrucoes
                    voz={screenProps.config.indexOf('voz') != -1}
                    info={[
                        i18n('teoTreNom.sections.instructions.hints.inform'),
                        i18n('teoTreNom.sections.instructions.hints.verify'),
                        i18n('teoTreNom.sections.instructions.hints.chances', { chances: screenProps.inputConfig.chances, tempo: screenProps.inputConfig.tempoBase }),
                    ]} />
                <Card style={{ marginBottom: 10 }}>
                    <Card.Header ref={r => this.nomeDaPeca = r} accessibilityLabel={`Peça: ${title}. Prossiga para ouvir a parte anatômica`} title={title} />
                    <Card.Body>
                        <View>

                            {(screenProps.anatomp.tipoPecaMapeamento == 'pecaDigital' && localizacaoRelativa != null) &&
                                <Text style={{ margin: 10, fontSize: 18, textAlign: 'center' }}>{identificador}</Text>
                            }

                            {screenProps.anatomp.tipoPecaMapeamento == 'pecaDigital' &&
                                <LocalizacaoPD parte={parte} pecasFisicas={pecasFisicas} exibirLabel={true} />
                            }

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
                                name={'Conteúdos teóricos'}
                                InputProps={{
                                    editable: timer > 0
                                }}
                            />
                        </View>
                        <Button disabled={disabled || disabledVerificacao} accessibilityLabel={(disabled || disabledVerificacao) ? 'Verificar Respostas. Botão. Desabilitado. Informe a parte e os conteúdos para habilitar' : `Verificar respostas. Botão. Toque duas vezes para abrir a verficação de respostas`} style={{ flex: 1, margin: 5, marginBottom: 0 }} onPressOut={this.props.onToggleDialog(true)} type='primary'>{i18n('teoTreNom.actions.check')}</Button>
                        <Button accessibilityLabel={`Próximo. Botão. Toque duas vezes para confirmar suas respostas`} style={{ flex: 1, margin: 5, marginBottom: 0 }} onPressOut={this.props.onSubmit} type='primary'>{i18n('actions.next')}</Button>
                    </Card.Body>
                </Card>
                <Modal
                    talkback={isTB}
                    open={open}
                    title={identificador}
                    acc={`${identificador}. Aberto. Prossiga para ouvir as informações da parte`}
                    footer={[{ text: i18n('actions.close'), onPress: this.props.onToggleDialog(false), acc: `Fechar. Botão. Toque duas vezes para fechar a verificação de respostas.` }]}
                >
                    <View accessible={true}>
                        <Text style={{ fontWeight: 'bold', color: '#000', marginBottom: 3 }}>{i18n('teoTreNom.common.yourAnswer')}:</Text>
                        <Text>{data[count].respostaParte}</Text>
                        <Text>{data[count].respostaConteudos}</Text>
                        <Text accessibilityLabel='Prossiga para ouvir a lista de respostas esperadas'></Text>
                    </View>
                    <Text accessibilityLabel={`Respostas esperadas. ${data[count].conteudos.length + 1} itens na lista. Prossiga para marcar as opções que você acertou.`} accessible style={{ color: '#000', marginBottom: 3, marginTop: 6 }}><Text style={{ fontWeight: 'bold' }}>{i18n('teoTreNom.common.expectedAnswers')} </Text>({i18n('teoTreNom.common.checkTheRights')}):</Text>
                    <List>
                        <List.Item>
                            <Option
                                label={`${i18n('common.part')} ${data[count].parte.nome}`}
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
                    <Card.Header title={i18n('common.summary')} />
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


const getValue = (field, value, item) => {
    if (value) {
        if (field == 'respostaConteudos') {
            return item.respostaConteudos + ". " + value;
        } else {
            return value;
        }
    } else {
        return ""
    }
}

const FormContainer = withI18n(_FormContainer)

class TeoTreNom extends Component {
    timer = null;
    fieldRef = []

    state = {
        data: [],
        count: 0,
        total: 0,
        open: false,
        timer: /*3 * */this.props.screenProps.inputConfig.tempoBase,
        maxTime: 60,
        tentativas: 0,
        loading: true,
        sinalScroll: 0,
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

        const timer = this.getMaxQuestionTime(array[this.state.count]);

        this.fieldRef = array.map(fd => [null])

        this.setState({ loading: false, data: array, timer: timer, maxTime: timer, total: array.length }, () => {
            this.onCount();
            Toast.hide();
        })
    }

    getMaxQuestionTime(obj) {
        const texto = obj.parte.nome;
        let tamanho = texto.length;

        if (!!obj.conteudos) {
            tamanho += obj.conteudos
                .map(text => text.length)
                .reduce((prev, cur) => prev + cur);
        }

        const writeTime = tamanho * this.getConfigs().tempoDigitacaoPorCaractere;
        const speakTime = tamanho * this.getConfigs().tempoFalaPorCaractere;

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
        const { navigation, screenProps, i18n } = this.props;
        const { data, count, loading, open, sinalScroll } = this.state;

        const _View = loading ? null : (
            count < data.length ? (
                <FormContainer
                    onSetSinalScroll={this.onSetSinalScroll}
                    onToggleDialog={this.onToggleDialog}
                    open={open}
                    screenProps={screenProps}
                    mainState={this.state}
                    onGetRef={this.onGetRef}
                    onChange={this.onChange}
                    onSubmit={this.onSubmit}
                    maxTentativa={this.props.screenProps.inputConfig.chances}
                />
            ) : <Resultados bc={['Roteiros', screenProps.anatomp.nome, 'Treinamento - Teórico - Localização-Conteúdo']} data={data} onRepeat={this.onRepeat} formatter={e => `Número ${e.localizacao.numero}, peça ${e.localizacao.pecaFisica.nome}`} />
        )

        return (
            <Container navigation={navigation} sinalScroll={sinalScroll}>
                {_View}
            </Container>
        )
    }


    onSetSinalScroll = () => this.setState({ sinalScroll: + new Date() })


    onToggleDialog = (open, cb = () => { }) => () => {
        const { data, count } = this.state;
        this.setState({ open }, cb)
        let acertou = this.checkAcertos(data[count]);
        if (acertou) {
            this.onSubmit();
        }
    }

    onRepeat = () => {
        const { data } = this.state;
        const dados = data.map(fd => ({ ...fd, acertou: false, respostaConteudos: '', respostaParte: '', correcao: Array(fd.conteudos.length + 1).fill(false) }));

        clearInterval(this.timer)

        this.setState({
            data: dados,
            count: 0,
            //    timer: 3 * this.props.screenProps.inputConfig.tempoBase,
            timer: this.state.maxTime,
            tentativas: 0
        }, () => this.onCount())
    }

    onErrorClick = () => { Toast.info('Parte não registrada'); announceForAccessibility('Parte não registrada') }

    onSubmit = () => {
        const { data, count, tentativas, timer } = this.state;
        const { i18n } = this.props

        let acertou = this.checkAcertos(data[count]);

        if (timer > 0) {
            if (acertou) {
                Toast.success(i18n('common.correct'), 3, this.onNext(acertou));
                announceForAccessibility('Acertou!')
            } else {
                this.setState({ tentativas: tentativas + 1 })
                if (tentativas == this.props.screenProps.inputConfig.chances - 1) {
                    Toast.fail(i18n('common.missed'), 3, this.onNext(acertou))
                    announceForAccessibility('Você errou.')
                } else {
                    const num = this.props.screenProps.inputConfig.chances - tentativas - 1;
                    const msg = i18n('teoTreNom.alerts.correctTheAnswer', { num, sufixo: num == 1 ? '' : 's' })
                    Toast.fail(msg, 3, () => this.onSetFocus(count))
                    this.setState({ timer: /*3 * */this.props.screenProps.inputConfig.tempoBase, })
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
            //    timer: 3 * this.props.screenProps.inputConfig.tempoBase,
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

        return item.correcao.every(i => i === true)

    }

    onCount = () => {
        this.timer = setInterval(() => {
            if (!this.state.open) {
                this.setState({ timer: this.state.timer - 1 })
            }
        }, 1000);
    }

    onChange = field => value => {
        const { data, count, timer } = this.state;

        if (value) {
            announceForAccessibility(`Texto detectado: ${value}`)
        } else {
            announceForAccessibility('Texto removido')
        }

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

export default withI18n(TeoTreNom);