import React, { Component } from 'react'

import {injectIntl} from 'react-intl'

export const withI18n = (Wrapped) => {
    class I18n extends Component{

        i18n = (id, values) => {
            return this.props.intl.formatMessage({id, defaultMessage: id}, values)
        }

        render(){
            const {intl, ...props} = this.props
            return <Wrapped {...props} i18n={this.i18n} />
        }
    }

    return injectIntl(I18n)
}