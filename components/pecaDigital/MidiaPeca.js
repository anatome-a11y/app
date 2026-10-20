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

    const tipo = modelo ? '3D' : '2D';

    if (modelo) {
        const dica = onSelect
            ? 'Arraste para girar. Toque na parte colorida ou no número nítido para escolher. Número esmaecido está do outro lado da peça.'
            : 'Arraste para girar. A parte colorida é a região marcada. Marca nítida está na face visível; marca esmaecida está do outro lado da peça.';
        return (
            <View accessibilityLabel={'Peça ' + tipo + '. ' + dica}>
                <Text style={{ marginLeft: 8, marginBottom: 4, fontSize: 12, fontWeight: 'bold' }}>{tipo}</Text>
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
        <View accessibilityLabel={'Peça ' + tipo}>
            <Text style={{ marginLeft: 8, marginBottom: 4, fontSize: 12, fontWeight: 'bold' }}>{tipo}</Text>
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
                    onStartShouldSetResponder={onSelect ? () => {
                        const parte = point.parte;
                        onSelect(point.label, {
                            parteId: parte && parte._id ? parte._id : parte,
                            parteNome: parte && parte.nome ? parte.nome : '',
                        });
                    } : undefined}
                    text={exibirLabel ? point.label : '  '}
                    style={{ top: point.y + '%', left: point.x + '%', position: 'absolute' }}>
                </Badge>
            )}
        </View>
    );
};

export default MidiaPeca;
