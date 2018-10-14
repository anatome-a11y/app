import React, { Component } from 'react'
import Modal from 'antd-mobile-rn/lib/modal';
import Flex from 'antd-mobile-rn/lib/flex';
import Button from 'antd-mobile-rn/lib/button';
import { focusOnView } from 'react-native-accessibility';
import {View, Text} from 'react-native'

class CustomModal extends Component {
    title = null

    componentWillReceiveProps(next){
        if(!this.props.open && next.open){
            setTimeout(() => focusOnView(this.title), 1000)
        }
    }

    render() {
        const {footer, open, acc, children, title, talkback} = this.props;

        return (
            <Modal
                transparent={!talkback}
                maskClosable={false}
                title={null}
                visible={open}
                closable={false}
                footer={footer}
            >
                <Text accessible={true} ref={r => this.title = r} accessibilityLabel={acc} style={{ padding: 5, textAlign: 'center', fontSize: 18 }}>{title}</Text>
                {children}
                {talkback && <Flex>
                    {footer.map(f => <Button accessibilityLabel={f.acc} type='ghost' style={{flex: 1, margin: 3}} key={f.text} children={f.text} onPressOut={f.onPress} />)}
                </Flex>}
            </Modal>
        )
    }
}

export default CustomModal;