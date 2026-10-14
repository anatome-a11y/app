import React, { Component } from 'react';
import { Text, View, WebView } from 'react-native';
import { announceForAccessibility } from 'react-native-accessibility';
import { extensao, origemDaUrl, pontos3d, urlSegura } from './midia';
import { HTML_VISUALIZADOR } from './visualizadorHtml';

class VisualizadorModelo extends Component {

    web = null;
    ultima = '';

    state = {
        erro: '',
        diag: '0. Componente montado, WebView ainda nao abriu',
    }

    componentDidUpdate(prev) {
        if (prev.url !== this.props.url) {
            this.ultima = '';
        }
        this.enviarCena();
    }

    registrar = texto => {
        console.log('[modelo3d] ' + texto);
        if (texto !== this.state.diag) {
            this.setState({ diag: texto });
        }
    }

    enviarCena = () => {
        if (!this.web || !this.web.postMessage) {
            this.registrar('WebView sem postMessage');
            return;
        }
        const { url, nome, pontos, modo, exibirLabel } = this.props;
        const endereco = urlSegura(url);
        const tipo = extensao(nome || url);
        const msg = JSON.stringify({
            type: 'load',
            url: endereco,
            fileType: tipo,
            pontos: pontos3d(pontos),
            modo: modo || 'leitura',
            exibirLabel: exibirLabel !== false,
        });
        if (msg === this.ultima) {
            return;
        }
        this.ultima = msg;
        this.registrar('App enviou a URL (' + (tipo || 'sem extensao') + ')\n' + endereco);
        this.web.postMessage(msg);
    }

    onMessage = event => {
        let data;
        try {
            data = JSON.parse(event.nativeEvent.data);
        } catch (e) {
            return;
        }
        if (data.type === 'diag') {
            const texto = [data.etapa, data.extra].filter(Boolean).join('\n');
            this.registrar(texto);
        }
        if (data.type === 'ready') {
            this.ultima = '';
            this.registrar('WebView pronto, pedindo o modelo');
            this.enviarCena();
        }
        if (data.type === 'loaded') {
            this.registrar('Modelo exibido');
            this.setState({ erro: '' });
        }
        if (data.type === 'error') {
            const erro = data.message || 'Não foi possível carregar o modelo 3D.';
            this.registrar(erro);
            this.setState({ erro: erro });
            announceForAccessibility(erro);
        }
        if (data.type === 'select' && this.props.onSelect && data.label != null) {
            this.props.onSelect(String(data.label));
        }
    }

    render() {
        const { url, largura, altura } = this.props;
        const { erro } = this.state;
        const lado = largura;

        return (
            <View style={{ width: lado }}>
                <WebView
                    ref={r => { this.web = r; }}
                    source={{ html: HTML_VISUALIZADOR, baseUrl: origemDaUrl(url) }}
                    style={{ width: lado, height: altura || lado, opacity: 0.99, backgroundColor: '#f7f7f7' }}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    scalesPageToFit={false}
                    scrollEnabled={false}
                    onLoadEnd={() => {
                        this.registrar('WebView terminou de abrir a pagina');
                        this.enviarCena();
                    }}
                    onError={() => this.registrar('WebView disparou onError')}
                    onMessage={this.onMessage}
                    mixedContentMode="always"
                />
                <Text style={{ fontSize: 11, color: '#222', backgroundColor: '#fff7d6', padding: 6 }}>
                    {this.state.diag}
                </Text>
                {erro ? (
                    <Text style={{ position: 'absolute', left: 8, right: 8, top: '45%', textAlign: 'center', color: 'rgba(0, 0, 0, 0.45)' }}>
                        {erro}
                    </Text>
                ) : null}
            </View>
        );
    }
}

export default VisualizadorModelo;
