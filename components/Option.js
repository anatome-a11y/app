
import Checkbox from 'antd-mobile-rn/lib/checkbox';
import React from 'react';
import { Text, View } from 'react-native';


const getAcc = (pre, checked, simple = false) => {
    const sel = checked ? 'Selecionado' : 'Não selecionado';
    const action = checked ? '' : 'Toque duas vezes para selecionar';
    const end = simple ? '' : 'Descrição:';
    return `${pre}. ${sel}. ${action}. ${end} `
}


const Option = ({ checked, onChange = null, label, title, children, _ref, disabled }) => (
    <Checkbox checked={checked} onChange={onChange} ref={_ref} disabled={disabled}>
        <View style={{ marginLeft: 15 }} >
            {title && <Text accessibilityLabel={getAcc(label, checked)} style={{ fontWeight: 'bold' }}>{title}: </Text>}
            <Text style={{ paddingRight: 25 }}>{children}</Text>
        </View>
    </Checkbox>
)

export const Simple = ({ checked, onChange = null, label, _ref, disabled }) => (
    <Checkbox checked={checked} onChange={onChange} ref={_ref} disabled={disabled}>
        <View style={{ marginLeft: 15 }} >
            {label && <Text accessibilityLabel={getAcc(label, checked, true)}>{label}</Text>}
        </View>
    </Checkbox>
)

export default Option