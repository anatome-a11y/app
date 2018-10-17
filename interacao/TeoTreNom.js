import React, { Component } from 'react';

import { View, Text, TouchableHighlight, TextInput } from 'react-native';
import Container from '../Container';
import List from 'antd-mobile-rn/lib/list';
import Card from 'antd-mobile-rn/lib/card';
import Toast from 'antd-mobile-rn/lib/toast';
import Button from 'antd-mobile-rn/lib/button';
import Flex from 'antd-mobile-rn/lib/flex';
import Checkbox from 'antd-mobile-rn/lib/checkbox';

import { announceForAccessibility, focusOnView } from 'react-native-accessibility';

import Resultados from './Resultados'
import Placar from './Placar'
import Input from '../components/Input'
import { norm } from '../utils'

import BC from '../components/Breadcrumbs'
import Instrucoes from '../components/Instrucoes'


class FormContainer extends React.Component {

    nomeDaPeca = null;
    dicaDaParte = null;

    state = {
        filtered: this.props.mainState.conteudos,
        pesquisa: ''
    }

    componentDidMount() {
        this.time2Focus = setTimeout(() => {
            focusOnView(this.nomeDaPeca)
        }, 500)
    }

    componentWillReceiveProps(next) {
        const { mainState } = this.props;

        //Se mudou a peça física, foco na peça física
        if (mainState.data[mainState.count].pecaFisica.nome != next.mainState.data[next.mainState.count].pecaFisica.nome) {
            focusOnView(this.nomeDaPeca);
            this.setState({
                filtered: this.props.mainState.conteudos,
                pesquisa: ''
            })
        } else {
            //Se muou apenas a parte: foco na parte
            if (mainState.count != next.mainState.count) {
                focusOnView(this.dicaDaParte);
                this.setState({
                    filtered: this.props.mainState.conteudos,
                    pesquisa: ''
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
        const { filtered } = this.state;

        const value = data[count].valores[0];


        const _Itens = filtered.length > 0 ? (
            filtered.map(conteudo => (
                <List.Item wrap multipleLine key={conteudo._id}>
                    <Checkbox checked={value._id == conteudo._id} onChange={this.onChange(conteudo)} >
                        <View style={{ marginLeft: 15 }} >
                            <Text>{conteudo.texto}</Text>
                        </View>
                    </Checkbox>
                </List.Item>
            ))
        ) : <List.Item><Text>Nenhum conteúdo foi encontrado</Text></List.Item>

        return (
            <View>
                <BC body={['Roteiros', anatomp.nome]} head={'Treinamento-Teórico-Nomear'} />
                <Instrucoes info={[
                    'Para cada parte de cada peça física selecione o conteúdo teórico correspondente e em seguida pressione o botão "Próximo" no fim da lista.',
                    'Caso necessário, utilize o filtro para buscar um conteúdo',
                    `Você tem ${screenProps.inputConfig.chances} chances para acertar e um tempo máximo de ${screenProps.inputConfig.tempo} segundos.`
                ]} />
                <Card style={{ marginBottom: 10 }}>
                    <Card.Header accessibilityLabel={`Peça: ${title}. Prossiga para ouvir a parte anatômica`} ref={r => this.nomeDaPeca = r} title={title} />
                    <Card.Body>
                        <Text ref={r => this.dicaDaParte = r} style={{ margin: 10, fontSize: 18, textAlign: 'center' }}>Parte {data[count].numero}</Text>
                        <Input
                            _ref={onGetRef(count)}
                            value={this.state.pesquisa}
                            onChange={this.onFilter}
                            name={'Filtro de conteúdos'}
                        // onDone={onSubmit}
                        />
                        <List ref={r => this.listRef = r} accessibilityLabel={`Conteúdos teóricos. Lista com ${filtered.length} itens. Prossiga para escolher um conteúdo`}>
                            {_Itens}
                        </List>
                        <Button disabled={!value} accessibilityLabel={`Próximo. Botão. Toque duas vezes para obter a próxima dica ou prossiga para ouvir as informações extras desta etapa`} style={{ flex: 1, margin: 5, marginBottom: 0 }} onPressOut={onSubmit} type='primary'>Próximo</Button>
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

    onFilter = pesquisa => {
        this.setState({
            pesquisa
        }, () => {
            const filtered = this.props.mainState.conteudos.filter(c => {
                return norm(c.texto).indexOf(norm(this.state.pesquisa)) != -1
            });

            this.setState({ filtered }, () => {
                announceForAccessibility(filtered.length > 0 ? `Na lista ${filtered.length} conteúdos. Prossiga para selecionar um destes conteúdos: ${filtered.map(f => f.texto).join(', ')}` : 'Nenhum conteúdo encontrado. Altere as palavras chave e tente novamente.')
            })
        })
    }


    onChange = conteudo => () => {
        this.props.onChangeValor(conteudo)
        announceForAccessibility(`${conteudo.texto} Selecionado`)
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
        conteudos: [],
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
            mapa.localizacao.map(loc => pecasFisicas[loc.pecaFisica._id].partesNumeradas.push({ parte: mapa.parte, numero: loc.numero }));
        })


        let flatData = [];

        Object.keys(pecasFisicas).forEach(key => {
            const { partesNumeradas, pf } = pecasFisicas[key];
            partesNumeradas.forEach(pn => {
                flatData = [...flatData, { ...pn, pecaFisica: pf }]
            })
        })


        let conteudosFlat = []

        //Gera a lista de conteúdos separada em singular e plural (Apenas o singular será utilizado)
        anatomp.roteiro.conteudos.forEach(conteudo => {
            if (conteudo.singular != '') {
                conteudosFlat.push({ ...conteudo, modo: 'singular', texto: conteudo.singular })
            }
        })

        const dados = flatData.map(fd => ({ ...fd, modo: 'singular', acertou: false, valores: [''] }));

        this.fieldRef = flatData.map(fd => [null])

        this.setState({ loading: false, data: dados, total: dados.length, conteudos: conteudosFlat }, () => {
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
                    onChangeValor={this.onChangeValor}
                    onSubmit={this.onSubmit}
                />
            ) : <Resultados data={data} onRepeat={this.onRepeat} formatter={e => `Numero ${e.numero}, peça ${e.pecaFisica.nome}`} />
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
                    const msg = `Resposta incorreta. Você tem mais ${num} tentativa${num == 1 ? '' : 's'}`
                    Toast.fail(msg, 3, () => this.onSetFocus(count))
                    announceForAccessibility(msg)
                }
            }
        } else {
            this.onNext(false)();
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
        if (config.indexOf('talkback') !== -1) {
            setTimeout(() => focusOnView(this.fieldRef[count]), 1500)
        } else {
            if (config.indexOf('nfc') == -1 && config.indexOf('voz') == -1) {
                this.fieldRef[count].focus()
            }
        }
    }

    checkAcertos = item => {
        if (item.modo == 'singular') {
            return item.valores[0].partes.find(p => p._id == item.parte._id) != undefined
        } else {
            alert('Plural não configurado')
            // return item.partes.every(p => item.valores.indexOf(p.numero) != -1)
            return false
        }
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

export default TeoTreNom;