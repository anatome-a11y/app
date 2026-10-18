import React, { Component } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View, WebView } from 'react-native';
import { announceForAccessibility } from 'react-native-accessibility';
import { travarRolagem } from '../rolagem';
import { definirFundoViewer, fundoViewerAtual, fundosViewer, ouvirFundoViewer } from './fundoViewer';
import { extensao, origemDaUrl, pontos3d, urlSegura } from './midia';
import { htmlVisualizador } from './visualizadorHtml';

class VisualizadorModelo extends Component {

    web = null;
    carregou = false;
    reenvio = null;
    soltarFundo = null;

    state = {
        erro: '',
        carregando: true,
        fundoId: fundoViewerAtual().id,
        html: '',
    }

    componentWillMount() {
        this.setState({ html: htmlVisualizador(this.montarCena()) });
    }

    componentDidMount() {
        this.soltarFundo = ouvirFundoViewer(fundo => {
            this.setState({ fundoId: fundo.id }, () => this.enviarCena());
        });
        this.reenvio = setInterval(() => {
            if (this.carregou) {
                return;
            }
            this.enviarCena();
        }, 600);
    }

    componentDidUpdate(prev) {
        if (prev.url !== this.props.url || prev.nome !== this.props.nome) {
            this.carregou = false;
            this.setState({
                carregando: true,
                erro: '',
                html: htmlVisualizador(this.montarCena()),
            });
            return;
        }
        if (prev.pontos !== this.props.pontos || prev.modo !== this.props.modo || prev.exibirLabel !== this.props.exibirLabel) {
            this.enviarCena();
        }
    }

    componentWillUnmount() {
        clearInterval(this.reenvio);
        if (this.soltarFundo) {
            this.soltarFundo();
        }
        travarRolagem(false);
    }

    montarCena = () => {
        const { url, nome, pontos, modo, exibirLabel } = this.props;
        const fundo = fundoViewerAtual();
        return {
            type: 'load',
            url: urlSegura(url),
            fileType: extensao(nome || url),
            pontos: pontos3d(pontos),
            modo: modo || 'leitura',
            exibirLabel: exibirLabel !== false,
            background: fundo.color,
        };
    }

    enviarCena = forcar => {
        if (!this.web || !this.web.injectJavaScript) {
            return;
        }
        const mensagem = JSON.stringify(this.montarCena());
        if (!forcar && this.carregou && mensagem === this.ultimaMensagem) {
            return;
        }
        this.ultimaMensagem = mensagem;
        const chamada = 'window.__receber && window.__receber(' + JSON.stringify(mensagem) + ');true;';
        this.web.injectJavaScript(chamada);
    }

    onMessage = event => {
        let data;
        try {
            data = JSON.parse(event.nativeEvent.data);
        } catch (e) {
            return;
        }
        if (data.type === 'gesture') {
            travarRolagem(!!data.active);
        }
        if (data.type === 'ready') {
            this.enviarCena();
        }
        if (data.type === 'loaded') {
            this.carregou = true;
            this.setState({ carregando: false, erro: '' });
        }
        if (data.type === 'error') {
            const erro = data.message || 'Não foi possível carregar o modelo 3D.';
            this.carregou = true;
            this.setState({ carregando: false, erro: erro });
            announceForAccessibility(erro);
        }
        if (data.type === 'select' && this.props.onSelect && data.label != null) {
            this.props.onSelect(String(data.label), {
                parteId: data.parteId || '',
                parteNome: data.parteNome || '',
            });
        }
    }

    escolherFundo = id => () => {
        definirFundoViewer(id);
    }

    render() {
        const { url, largura, altura } = this.props;
        const { erro, carregando, fundoId, html } = this.state;
        const lado = largura;
        const fundo = fundosViewer.filter(item => item.id === fundoId)[0] || fundoViewerAtual();

        return (
            <View style={{ width: lado }}>
                <View
                    onStartShouldSetResponderCapture={() => {
                        travarRolagem(true);
                        return false;
                    }}
                    onTouchEnd={() => travarRolagem(false)}
                    onTouchCancel={() => travarRolagem(false)}
                >
                    <WebView
                        ref={r => { this.web = r; }}
                        source={{ html: html, baseUrl: origemDaUrl(url) }}
                        style={{ width: lado, height: altura || lado, opacity: 0.99, backgroundColor: fundo.color }}
                        javaScriptEnabled={true}
                        domStorageEnabled={true}
                        scalesPageToFit={false}
                        scrollEnabled={false}
                        onLoadEnd={() => this.enviarCena()}
                        onError={() => this.setState({ carregando: false, erro: 'Não foi possível abrir o visualizador 3D.' })}
                        onMessage={this.onMessage}
                        mixedContentMode="always"
                    />
                    {carregando ? (
                        <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: fundo.color }} pointerEvents="none">
                            <ActivityIndicator size="large" color={fundo.id === 'white' ? '#108ee9' : '#ffffff'} />
                            <Text style={{ marginTop: 8, color: fundo.id === 'white' ? 'rgba(0,0,0,0.65)' : '#ffffff' }}>Carregando modelo 3D...</Text>
                        </View>
                    ) : null}
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 4 }}>
                    {fundosViewer.map((opcao, indice) => {
                        const selecionado = opcao.id === fundo.id;
                        return (
                            <TouchableOpacity
                                key={opcao.id}
                                accessibilityLabel={'Fundo ' + opcao.label}
                                onPress={this.escolherFundo(opcao.id)}
                                style={{
                                    width: 18,
                                    height: 18,
                                    borderRadius: 9,
                                    marginLeft: indice === 0 ? 0 : 6,
                                    backgroundColor: opcao.color,
                                    borderWidth: selecionado ? 2 : 1,
                                    borderColor: selecionado ? '#108ee9' : 'rgba(0,0,0,0.45)',
                                }}
                            />
                        );
                    })}
                </View>
                {erro ? (
                    <Text style={{ position: 'absolute', left: 8, right: 8, top: '40%', textAlign: 'center', color: 'rgba(0, 0, 0, 0.65)' }}>
                        {erro}
                    </Text>
                ) : null}
            </View>
        );
    }
}

export default VisualizadorModelo;
