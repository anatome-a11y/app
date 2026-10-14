import Badge from 'antd-mobile-rn/lib/badge';
import React from 'react';
import { Image, Text, View } from 'react-native';
import { ehModelo3d, urlSegura } from './midia';
import VisualizadorModelo from './VisualizadorModelo';

const MidiaPeca = ({ midia, exibirLabel = true, onSelect, largura }) => {
    const lado = largura;
    const pontos = (midia && midia.pontos) || [];
    const endereco = urlSegura(midia && midia.url);
    const modelo = midia && (ehModelo3d(midia.name) || ehModelo3d(endereco));

    if (modelo) {
        const dica = onSelect
            ? 'Arraste para girar. Toque no número nítido para escolher a parte. Número esmaecido está do outro lado da peça.'
            : 'Arraste para girar. Marca nítida está na face visível; marca esmaecida está do outro lado da peça.';
        return (
            <View accessibilityLabel={dica}>
                <VisualizadorModelo
                    url={endereco}
                    nome={midia.name || endereco}
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
                source={{ uri: endereco }}
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
