import React, { Component } from 'react';
import { Text, View, WebView } from 'react-native';
import { announceForAccessibility } from 'react-native-accessibility';
import { extensao, origemDaUrl, pontos3d } from './midia';
import { HTML_VISUALIZADOR } from './visualizadorHtml';

class VisualizadorModelo extends Component {

    web = null;
    ultima = '';

    state = {
        erro: '',
    }

    componentDidUpdate(prev) {
        if (prev.url !== this.props.url) {
            this.ultima = '';
        }
        this.enviarCena();
    }

    enviarCena = () => {
        if (!this.web || !this.web.postMessage) {
            return;
        }
        const { url, nome, pontos, modo, exibirLabel } = this.props;
        const msg = JSON.stringify({
            type: 'load',
            url: url,
            fileType: extensao(nome || url),
            pontos: pontos3d(pontos),
            modo: modo || 'leitura',
            exibirLabel: exibirLabel !== false,
        });
        if (msg === this.ultima) {
            return;
        }
        this.ultima = msg;
        this.web.postMessage(msg);
    }

    onMessage = event => {
        let data;
        try {
            data = JSON.parse(event.nativeEvent.data);
        } catch (e) {
            return;
        }
        if (data.type === 'ready') {
            this.ultima = '';
            this.enviarCena();
        }
        if (data.type === 'loaded') {
            this.setState({ erro: '' });
        }
        if (data.type === 'error') {
            const erro = data.message || 'Não foi possível carregar o modelo 3D.';
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
            <View style={{ width: lado, height: altura || lado }}>
                <WebView
                    ref={r => { this.web = r; }}
                    source={{ html: HTML_VISUALIZADOR, baseUrl: origemDaUrl(url) }}
                    style={{ width: lado, height: altura || lado, opacity: 0.99, backgroundColor: '#f7f7f7' }}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    scalesPageToFit={false}
                    scrollEnabled={false}
                    onLoadEnd={this.enviarCena}
                    onMessage={this.onMessage}
                    mixedContentMode="always"
                />
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
