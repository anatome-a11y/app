import React, { Component } from 'react';

import { View, Text } from 'react-native';
import Container from './Container';

import Accordion from 'antd-mobile-rn/lib/accordion';
import List from 'antd-mobile-rn/lib/list';

import Checkbox from 'antd-mobile-rn/lib/checkbox';

const { CheckboxItem } = Checkbox;
const { Panel } = Accordion;

class Roteiro extends Component {
    render() {
        const { navigation } = this.props;

        return (
            <Container navigation={navigation}>
                <Accordion onChange={this.onChange} defaultActiveKey="2">
                    <Panel header="Tipo de conteúdo">
                        <List>
                            <CheckboxItem checked={false} onChange={this.onChange('tipoConteudo', 'pratico')}>
                                <Text style={{fontWeight: 'bold'}}>Prático: </Text><Text>Identificação anatômica por nome</Text>
                            </CheckboxItem>
                            <CheckboxItem checked={false} onChange={this.onChange('tipoConteudo', 'teorico')}>
                            <Text style={{fontWeight: 'bold'}}>Teórico: </Text><Text>Identificação anatômica por informações teóricas associadas</Text>
                            </CheckboxItem>
                        </List>
                    </Panel>
                    <Panel header="Modo de aprendizagem">
                        <List>
                            <CheckboxItem checked={false} onChange={this.onChange('modoAprendizagem', 'estudo')}>
                            <Text style={{fontWeight: 'bold'}}>Estudo: </Text><Text>Você seleciona uma parte anatômica e o sistema te informa o conteúdo correspondente.</Text>
                            </CheckboxItem>
                            <CheckboxItem checked={false} onChange={this.onChange('modoAprendizagem', 'treinamento')}>
                            <Text style={{fontWeight: 'bold'}}>Treinamento: </Text><Text>O sistema te informa um conteúdo e você indica a parte anatômica correspondente.</Text>
                            </CheckboxItem>
                        </List>
                    </Panel>
                    <Panel header="Sentido de identificação">
                        <List>
                            <CheckboxItem checked={false} onChange={this.onChange('sentidoIdentificacao', 'localizar')}>
                                <Text style={{fontWeight: 'bold'}}>Localizar: </Text><Text>Sentido: Nome/teoria -> Localização</Text>
                            </CheckboxItem>
                            <CheckboxItem checked={false} onChange={this.onChange('sentidoIdentificacao', 'nomear')}>
                                <Text style={{fontWeight: 'bold'}}>Nomear: </Text><Text>Sentido: Localização -> Nome/teoria</Text>
                            </CheckboxItem>
                        </List>
                    </Panel>
                </Accordion>
            </Container>
        )
    }

    onChange = (field, value) => () => {}    
}

export default Roteiro;