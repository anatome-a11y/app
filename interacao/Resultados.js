import React, { Component } from 'react';


import { View, Text } from 'react-native';
import List from 'antd-mobile-rn/lib/list';
import Card from 'antd-mobile-rn/lib/card';
import Button from 'antd-mobile-rn/lib/button';

import { announceForAccessibility, focusOnView } from 'react-native-accessibility';
const ListItem = List.Item;



class Resultados extends React.Component {

    mainView = null;

    componentDidMount() {
        setTimeout(() => {
            this.mainView && focusOnView(this.mainView)
        }, 1000)
    }


    render() {
        const { data, onRepeat, formatter } = this.props;

        const erros = data.filter(d => d.acertou == false);
        const total = data.length;
        const acertos = total - erros.length
        const aprov = Number(((acertos * 100) / total).toFixed(2));

        const accLabel = `Total de questões: ${total}. Acertos: ${acertos}. Aproveitamento: ${aprov} por cento.`;

        return (
            <View>
                <View ref={r => this.mainView = r} accessible={true} accessibilityLabel={accLabel}>
                    <Card style={{ marginBottom: 15 }}>
                        <Card.Header title='Placar (acertos)' />
                        <Card.Body>
                            <Text style={{ flex: 1, fontSize: 35, textAlign: 'center', fontWeight: 'bold' }}>{acertos} /<Text>{total}</Text></Text>
                            <Text style={{ flex: 1, fontSize: 25, textAlign: 'center' }}>{aprov}% de acertos</Text>
                        </Card.Body>
                    </Card>
                </View>

                {
                    (acertos != total) && (
                        <Card >
                            <Card.Header title='Itens com resposta incorreta' />
                            <Card.Body>
                                <List>
                                    {
                                        erros.map((e, idx) => (
                                            <ListItem wrap multipleLine key={idx}>{formatter(e)}</ListItem>
                                        ))
                                    }
                                </List>
                            </Card.Body>
                        </Card>
                    )
                }

                <Button style={{ flex: 1, marginTop: 15 }} accessibilityLabel='Treinar novamente. Botão. Toque para repetir o treinamento' onPressOut={onRepeat} type='primary'>Treinar novamente</Button>
            </View>
        )
    }
}


export default Resultados