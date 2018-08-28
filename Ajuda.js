import React, { Component } from 'react';

import { View, Text } from 'react-native';
import Container from './Container';

class Ajuda extends Component{
    render(){
        const {navigation} = this.props;

        return (
            <Container navigation={navigation}>
                <Text>Ajuda</Text>
            </Container>
        )
    }
}

export default Ajuda;