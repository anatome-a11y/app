
import React, { Component } from 'react';
import AppContext from './AppContext'

const AppContextHOC = Wrapped => props => (
    <AppContext.Consumer>
        {value => <Wrapped {...props} {...value} />}
    </AppContext.Consumer>
)

export default AppContextHOC;