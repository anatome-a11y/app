import Badge from 'antd-mobile-rn/lib/badge';
import React from 'react';
import { Image, Text, View } from 'react-native';
import { ehModelo3d } from './midia';
import VisualizadorModelo from './VisualizadorModelo';

const MidiaPeca = ({ midia, exibirLabel = true, onSelect, largura }) => {
    const lado = largura;
    const pontos = (midia && midia.pontos) || [];
    const modelo = midia && (ehModelo3d(midia.name) || ehModelo3d(midia.url));

    if (modelo) {
        const dica = onSelect
            ? 'Arraste para girar. Toque no número para escolher a parte.'
            : 'Arraste para girar. A parte em azul é a desta etapa.';
        return (
            <View accessibilityLabel={dica}>
                <VisualizadorModelo
                    url={midia.url}
                    nome={midia.name || midia.url}
                    pontos={pontos}
                    modo={onSelect ? 'selecao' : 'leitura'}
                    exibirLabel={exibirLabel}
                    onSelect={onSelect}
                    largura={lado}
                    altura={lado}
                />
                <Text style={{ marginTop: 4, marginBottom: 8, marginLeft: 8, fontSize: 10 }}>{dica}</Text>
            </View>
        );
    }

    return (
        <View>
            <Image
                style={{
                    width: lado,
                    height: lado,
                    resizeMode: 'stretch',
                    position: 'relative',
                }}
                source={{ uri: midia.url }}
            />
            {pontos.map((point, idxPonto) =>
                <Badge
                    key={point._id || idxPonto}
                    onStartShouldSetResponder={onSelect ? () => { onSelect(point.label); } : undefined}
                    text={exibirLabel ? point.label : '  '}
                    style={{ top: point.y + '%', left: point.x + '%', position: 'absolute' }}>
                </Badge>
            )}
        </View>
    );
};

export default MidiaPeca;
