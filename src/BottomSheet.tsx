import React from 'react';
import {
    View,
    KeyboardAvoidingView,
    Dimensions,
    ViewProps
} from 'react-native';
import Animated, {Easing} from 'react-native-reanimated';
import styles from "./styles";
import Portal from './portal/Portal';
import {
    PanGestureHandler,
    TapGestureHandler,
    State
} from 'react-native-gesture-handler';


const WINDOW_HEIGHT = Dimensions.get('window').height;

const {
    Clock,
    Value,
    block,
    clockRunning,
    cond,
    eq,
    set,
    startClock,
    stopClock,
    timing,
    call,
    event,
    divide,
    sub,
    interpolate,
    Extrapolate
} = Animated;

const ANIMATION = {
    CLOSE: 0,
    OPEN: 1,
    MOVING: 2,
    STOPPED: 3
};

function runTiming(clock: Animated.Clock, value: Animated.Node<number>, dest: number, duration: number, onFinish?: Function) {
    const state = {
        finished: new Value(0),
        position: new Value(0),
        time: new Value(0), // set the current value of clock
        frameTime: new Value(0)
    };
    const config = {
        duration,
        toValue: new Value(0),
        easing: Easing.linear
    };

    const timeSyncedWithClock = new Value(0); // flag to track if we need to sync

    return block([
        cond(
            clockRunning(clock),
            // condition to sync the state.time with clock on first invocation
            cond(eq(timeSyncedWithClock, 0), [
                set(state.time, clock),
                set(timeSyncedWithClock, 1) // set flag to not update this value second time
            ]),
            [
                set(timeSyncedWithClock, 0), // reset the flag
                set(state.finished, 0),
                set(state.time, clock), // set the current value of clock
                set(state.position, value),
                set(state.frameTime, 0),
                set(config.toValue, dest),
                startClock(clock)
            ]
        ),
        timing(clock, state, config),
        cond(state.finished, stopClock(clock)),
        cond(state.finished, call([], () => onFinish && onFinish(value))),
        state.position
    ]);
}


const runToggle = (
    clock: Animated.Clock,
    state: Animated.Value<number>,
    value: Animated.Value<number>,
    duration: number,
    dest: { open: number, close: number },
    onFinish: Function
) => block([
    cond(eq(state, ANIMATION.OPEN), set(value, runTiming(clock, value, dest.open, duration, onFinish))),
    cond(eq(state, ANIMATION.CLOSE), set(value, runTiming(clock, value, dest.close, duration, onFinish)))
]);

const runOpacityToggle = (
    clock: Animated.Clock,
    state: Animated.Value<number>,
    value: Animated.Value<number>,
    duration: number,
    dest: { open: number, close: number }
) => block([
    cond(eq(state, ANIMATION.OPEN), set(value, runTiming(clock, value, dest.open, duration))),
    cond(eq(state, ANIMATION.CLOSE), set(value, runTiming(clock, value, dest.close, duration)))
]);

type Props = {
    height: number,
    duration: number,
    closeOnDragDown?: boolean,
    closeOnPressMask?: boolean,
    fadeMask: boolean,
    style?: ViewProps,
    contentStyle: ViewProps,
    onClose?: () => void,
    onOpen?: () => void,
    usePortal: boolean,
    children?: React.ReactNode
}

type StateType = {
    visible: boolean,
    closing: boolean
};


export default class BottomSheet extends React.Component<Props, StateType> {

    static defaultProps = {
        duration: 300,
        closeOnDragDown: true,
        closeOnPressMask: true,
        fadeMask: true,
        onClose: null,
        onOpen: null,
        children: <View/>,
        usePortal: true
    };

    private readonly clock = new Clock();
    private readonly opacityClock = new Clock();
    private readonly gestureState: Animated.Value<number>;
    private readonly transY: Animated.Value<number>;
    private readonly absY: Animated.Value<number>;
    private readonly bgOpacity: Animated.Value<number>;
    private readonly onGestureEvent: any;
    private maxHeight: number;


    constructor(props: Props) {
        super(props);

        this.state = {visible: false, closing: false};

        this.gestureState = new Value(ANIMATION.CLOSE);
        this.transY = new Value(props.height);
        this.absY = new Value(0);
        this.bgOpacity = new Value(1);
        this.maxHeight = 0;

        this.onGestureEvent = event([
            {
                nativeEvent: {
                    translationY: this.transY,
                    absoluteY: this.absY
                }
            }
        ]);
    }

    getClampedHeight = (): number => {
        const {height} = this.props;

        const halfWindowHeight = WINDOW_HEIGHT / 2;
        // we only do this check to make sure that the maxHeight is a valid value.
        const isMaxHeightValid = this.maxHeight > halfWindowHeight;

        if (isMaxHeightValid) return Math.min(height, this.maxHeight);

        return height;
    };

    _onHandlerStateChange = (e: any) => {
        const {nativeEvent} = e;
        if (nativeEvent.oldState === State.BEGAN) {
            this.gestureState.setValue(ANIMATION.MOVING);
        }
        if (nativeEvent.state === State.END) {
            const {translationY, absoluteY} = nativeEvent;

            const {height} = this.props;
            if (height / 3 - translationY < 0) {
                this.bgOpacity.setValue((WINDOW_HEIGHT - absoluteY) / height);
                this._toggleVisibility(false);
            } else {
                this.gestureState.setValue(ANIMATION.OPEN);
            }
        }
    };

    _toggleVisibility = (visible: boolean) => {
        const {onClose, onOpen} = this.props;

        this.setState({closing: !visible});
        if (visible) {
            this.setState({visible});
            this.gestureState.setValue(ANIMATION.OPEN);
            if (typeof onOpen === 'function') onOpen();
        } else {
            this.gestureState.setValue(ANIMATION.CLOSE);
            if (typeof onClose === 'function') onClose();
        }
    };

    open() {
        return new Promise((resolve) => {
            this._toggleVisibility(true);
            // The promise will be resolved when the opening animation ends!
            setTimeout(() => {
                resolve();
            }, this.props.duration + 30);
        });
    }

    close() {
        return new Promise((resolve) => {
            this._toggleVisibility(false);
            // The promise will be resolved when the closing animation ends!
            setTimeout(() => {
                resolve();
            }, this.props.duration + 30);
        });
    }

    _onAnimationFinish = () => {
        this.gestureState.setValue(ANIMATION.STOPPED);
        if (this.state.closing && this.state.visible) {
            this.setState({visible: false});
        }
    };

    shouldComponentUpdate(nextProps: Readonly<Props>, nextState: Readonly<StateType>, nextContext: any): boolean {
        const {visible} = this.state;

        return nextState.visible !== visible;
    }

    _onMaskPress = (event: any) => {
        if (this.props.closeOnPressMask && event.nativeEvent.state === State.ACTIVE) {
            this.gestureState.setValue(ANIMATION.STOPPED);

            this.close();
        }
    };

    defineMaxLayoutHeight = (event: any) => {
        const {height} = event.nativeEvent.layout;

        if (height > 0) this.maxHeight = height;
    }

    render() {
        const {children, style, contentStyle, fadeMask, closeOnDragDown, duration, usePortal} = this.props;
        const {visible} = this.state;
        const height = this.getClampedHeight();

        return (
            <Portal enabled={usePortal}>
                <View
                    onLayout={this.defineMaxLayoutHeight}
                    style={[styles.wrapper, style, {
                        opacity: visible ? 1 : 0,
                        height: visible ? undefined : 0
                    }]}
                    pointerEvents={visible ? 'auto' : 'none'}
                >
                    <Animated.Code>
                        {() => block([
                            runToggle(this.clock, this.gestureState, this.transY, duration, {
                                open: 0,
                                close: Math.abs(height)
                            }, this._onAnimationFinish)
                        ])
                        }
                    </Animated.Code>
                    <Animated.Code>
                        {() => block([
                            cond(eq(fadeMask ? 1 : 0, 1), runOpacityToggle(this.opacityClock, this.gestureState, this.bgOpacity, duration, {
                                open: 1,
                                close: 0
                            }))
                        ])
                        }
                    </Animated.Code>

                    <View style={{flex: 1}}>
                        <View style={{flex: 1}}/>
                        <TapGestureHandler onHandlerStateChange={this._onMaskPress}>
                            <Animated.View style={[styles.mask, {
                                opacity: cond(eq(this.gestureState, ANIMATION.MOVING), divide(sub(WINDOW_HEIGHT, this.absY), height), this.bgOpacity)
                            }]}
                            />
                        </TapGestureHandler>
                        <KeyboardAvoidingView enabled behavior="position">
                            <PanGestureHandler
                                enabled={closeOnDragDown}
                                activeOffsetY={[-10, 10]}
                                onGestureEvent={this.onGestureEvent}
                                onHandlerStateChange={this._onHandlerStateChange}
                            >
                                <Animated.View
                                    style={[styles.container, contentStyle, {height}, {
                                        transform: [{
                                            translateY: interpolate(this.transY, {
                                                inputRange: [0, height],
                                                outputRange: [0, height],
                                                extrapolate: Extrapolate.CLAMP
                                            })
                                        }]
                                    } as any
                                    ]}
                                >
                                    {children}
                                </Animated.View>
                            </PanGestureHandler>
                        </KeyboardAvoidingView>
                    </View>
                </View>
            </Portal>
        );
    }
}