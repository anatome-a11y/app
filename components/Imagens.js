import React, { Component } from 'react';
import { View } from 'react-native';
import FitImage from 'react-native-fit-image';


const Imagens = ({ midias, config }) => (
    (config.indexOf('video_imagem') != -1 && config.indexOf('talkback') == -1) && (
        <View style={{marginTop: 5}} accessible={true} accessibilityLabel='Imagens ilustrativas' >
            {
                midias.filter(midia => midia.type.indexOf('image') != -1).map(midia => (
                    <View key={midia._id}>
                        <FitImage
                            source={{ uri: midia.url }}
                        />
                    </View>
                ))
            }
        </View>
    )
)


export default Imagens;