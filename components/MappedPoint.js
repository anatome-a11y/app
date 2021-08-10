
import React, { Component } from 'react';
import Modal from '../components/Modal'
import { Pressable } from 'react-native';

import Button from 'antd-mobile-rn/lib/button';
import Badge from 'antd-mobile-rn/lib/badge';


class MappedPoint extends Component {


    state = {
        pecasFisicas: {},
        pecaFisica: '',
        loading: true,
        parte: undefined,
        value: '',
        conteudos: []
    }

    onOpen = () => this.setState({ open: true })

    onClose = () => this.setState({ open: false })

    render() {
        const { value, pecasFisicas, pecaFisica, parte, conteudos, open } = this.state;

        const { key, point, idx, idxPonto } = this.props;


        return (



            <Badge text={point.label} style={{ top: point.y + "%", left: point.x + "%", position: 'absolute' }}>
                <Pressable onPress={this.onOpen}></Pressable>
            </Badge>
            &&
            <Modal

                open={open}
                title={parte ? parte.parte.nome : null}
                acc={`Aberto. Prossiga para ouvir`}
                footer={[
                    { text: 'Fechar', onPress: this.onClose, acc: `Fechar. Botão. Toque duas vezes para fechar` },
                ]}
            >
                {point.parte.descricao}
            </Modal>



        )
    }
}

export default MappedPoint;