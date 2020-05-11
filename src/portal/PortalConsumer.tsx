/**
 * Portal allows to render a component at a different place in the parent tree.
 * This code was taken from react-native-paper.
 * https://github.com/callstack/react-native-paper/tree/master/src/components/Portal
 *
 */

import * as React from 'react';
import { PortalMethods } from './PortalHost';

type Props = {
    manager: PortalMethods;
    children: React.ReactNode;
};

export default class PortalConsumer extends React.Component<Props> {
    async componentDidMount() {
        this.checkManager();

        // Delay updating to prevent React from going to infinite loop
        await Promise.resolve();

        this.key = this.props.manager.mount(this.props.children);
    }

    componentDidUpdate() {
        this.checkManager();

        this.props.manager.update(this.key, this.props.children);
    }

    componentWillUnmount() {
        this.checkManager();

        this.props.manager.unmount(this.key);
    }

    private key: any;

    private checkManager() {
        if (!this.props.manager) {
            throw new Error(
                'Looks like you forgot to wrap your root component with `BottomSheetPortalHost` component from `@vaicar/react-native-bottom-sheet`.\n\n' +
                "Please read our Setup guide and make sure you've followed all the required steps.\n\n" +
                'https://github.com/blongg/react-native-bottom-sheet#setup \n\n' +
                'If you do not want to wrap your root component, set the usePortal prop to false.'
            );
        }
    }

    render() {
        return null;
    }
}
