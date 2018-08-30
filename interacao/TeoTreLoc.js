import React, { Component } from 'react';

import { View, Text } from 'react-native';
import Container from '../Container';

class TeoTreLoc extends Component{
    render(){
        const {navigation, screenProps} = this.props;

        const {roteiro} = screenProps;

        return (
            <Container navigation={navigation}>
                <Text>TeoTreLoc</Text>
            </Container>
        )
    }
}

export default TeoTreLoc;