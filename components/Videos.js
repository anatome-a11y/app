import React, { Component } from 'react';
import { View } from 'react-native';

import Video from 'react-native-video-controls';

const Videos = ({ midias, config }) => (
    config.indexOf('video_imagem') != -1 && (
        <View style={{marginTop: 5}} accessible={true} accessibilityLabel='Vídeos ilustrativos' >
            {
                midias.filter(midia => midia.type.indexOf('video') != -1).map(midia => (
                    <View key={midia._id}>
                        <Video
                            source={{ uri: midia.url }}
                            resizeMode={"cover"}
                            // repeat={true}
                            paused
                            playInBackground={false}
                            playWhenInactive={false}
                            style={{
                                aspectRatio: 1,
                                width: "100%"
                            }}
                        />
                    </View>
                ))
            }
        </View>)
)

export default Videos;