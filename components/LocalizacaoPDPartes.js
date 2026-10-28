import React from 'react';
import { Dimensions, Text, View } from 'react-native';
import MidiaPeca from './pecaDigital/MidiaPeca';

const windowWidth = Dimensions.get('window').width;

const LocalizacaoPDPartes = ({ pecaFisica, pecasFisicas = [], exibirLabel = true, onClickParte }) => {
    const id = pecaFisica && pecaFisica._id;
    const peca = Array.isArray(pecasFisicas)
        ? pecasFisicas.find(item => item && item._id == id)
        : pecasFisicas[id];

    if (!peca || !peca.midias) {
        return <View />;
    }

    return (
        <View>
            {peca.midias.map((image, idx) =>
                <View accessible={true} key={(image._id || peca._id) + '-' + idx}>
                    <MidiaPeca
                        midia={image}
                        exibirLabel={exibirLabel}
                        largura={windowWidth - 30}
                        onSelect={onClickParte ? (label) => onClickParte(label)() : undefined}
                    />
                    {image.vista &&
                        <Text style={{ marginBottom: 8, marginLeft: 8 }}>
                            <Text style={{ fontSize: 10, fontWeight: 'bold' }}>Vista: </Text>{"\n"}
                            <Text style={{ fontSize: 10 }}>{image.vista}</Text>
                        </Text>
                    }
                    {image.referencia &&
                        <Text style={{ marginBottom: 8, marginLeft: 8 }}>
                            <Text style={{ fontSize: 10, fontWeight: 'bold' }}>Referência: </Text>{"\n"}
                            <Text style={{ fontSize: 10 }}>{image.referencia}</Text>
                        </Text>
                    }
                </View>
            )}
        </View>
    );
};

export default LocalizacaoPDPartes;
