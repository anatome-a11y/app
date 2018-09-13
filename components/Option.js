
import React, { Component } from 'react';

import { View, Text } from 'react-native';


import Checkbox from 'antd-mobile-rn/lib/checkbox';

const getAcc = (pre, checked) => {
    const sel = checked ? 'Selecionado' : 'Não selecionado';
    const action = checked ? '' : 'Toque duas vezes para selecionar';
    return `${pre}. ${sel}. ${action}. Descrição: `
}


const Option = ({ checked, onChange = null, label, title, children, _ref, disabled }) => (
    <Checkbox checked={checked} onChange={onChange} ref={_ref} disabled={disabled}>
        <View style={{ marginLeft: 15 }} >
            {title && <Text accessibilityLabel={getAcc(label, checked)} style={{ fontWeight: 'bold' }}>{title}: </Text>}
            <Text>{children}</Text>
        </View>
    </Checkbox>
)

export default Option