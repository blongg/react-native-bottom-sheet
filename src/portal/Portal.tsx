/**
 * Portal allows to render a component at a different place in the parent tree.
 * This code was taken from react-native-paper.
 * https://github.com/callstack/react-native-paper/tree/master/src/components/Portal
 *
 */

import React, {Fragment} from 'react';
import PortalConsumer from './PortalConsumer';
import {PortalContext, PortalMethods} from './PortalHost';

type Props = {
    /**
     * Content of the `Portal`.
     */
    children: React.ReactNode;
    enabled: boolean;
};

export default class Portal extends React.Component<Props> {
    render() {
        const {children, enabled} = this.props;

        if (!enabled)
            return <Fragment>{children}</Fragment>

        return (
            <PortalContext.Consumer>
                {manager => (
                    <PortalConsumer manager={manager as PortalMethods}>
                        {children}
                    </PortalConsumer>
                )}
            </PortalContext.Consumer>
        );
    }
}