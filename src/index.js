import React from "react";
import PropTypes from "prop-types";
import { Animated, TouchableWithoutFeedback, InteractionManager } from "react-native";
const PRESS_RETENTION_OFFSET = { top: 20, left: 20, right: 20, bottom: 30 };
const EdgeInsetsPropType = PropTypes.shape({
  top: PropTypes.number,
  left: PropTypes.number,
  bottom: PropTypes.number,
  right: PropTypes.number
});
const noop = () => {};
export default class TouchableBounce extends TouchableWithoutFeedback {
  static propTypes = {
    onPress: PropTypes.func,
    onPressIn: PropTypes.func,
    onPressOut: PropTypes.func,
    // The function passed takes a callback to start the animation which should
    // be run after this onPress handler is done. You can use this (for example)
    // to update UI before starting the animation.
    onPressWithCompletion: PropTypes.func,
    // the function passed is called after the animation is complete
    onPressAnimationComplete: PropTypes.func,
    /**
     * When the scroll view is disabled, this defines how far your touch may
     * move off of the button, before deactivating the button. Once deactivated,
     * try moving it back and you'll see that the button is once again
     * reactivated! Move it back and forth several times while the scroll view
     * is disabled. Ensure you pass in a constant to reduce memory allocations.
     */
    pressRetentionOffset: EdgeInsetsPropType,
    /**
     * This defines how far your touch can start away from the button. This is
     * added to `pressRetentionOffset` when moving off of the button.
     * ** NOTE **
     * The touch area never extends past the parent view bounds and the Z-index
     * of sibling views always takes precedence if a touch hits two overlapping
     * views.
     */
    hitSlop: EdgeInsetsPropType
  };
  static defaultProps = {
    onPressIn: noop,
    onPressOut: noop,
    onPress: noop
  };
  state = {
    ...this.touchableGetInitialState(),
    scale: new Animated.Value(1)
  };
  bounceTo = (value, velocity, bounciness, callback) => {
    Animated.spring(this.state.scale, {
      toValue: value,
      velocity,
      bounciness,
      useNativeDriver: true,
    }).start(callback);
  };
  touchableHandleActivePressIn = e => {
    this.bounceTo(0.6, 0.1, 0);
    this.props.onPressIn(e);
  };
  touchableHandleActivePressOut = e => {
    this.bounceTo(1, 0.2, 0);
    this.props.onPressOut(e);
  };
  touchableHandlePress = (e) => {
    const { onPressWithCompletion, onPressAnimationComplete } = this.props;
    if (onPressWithCompletion) {
      onPressWithCompletion(() => {
        this.state.scale.setValue(0.88);
        this.bounceTo(1, 0.8, 10, onPressAnimationComplete);
      });
      return;
    }

    this.bounceTo(1, 0.8, 10, onPressAnimationComplete);
    // InteractionManager.runAfterInteractions(() => {

    // });
    requestAnimationFrame(() => this.props.onPress(e))
  };
  touchableGetPressRectOffset = () => {
    return this.props.pressRetentionOffset || PRESS_RETENTION_OFFSET;
  };

  touchableGetHitSlop = () => {
    return this.props.hitSlop;
  };

  touchableGetHighlightDelayMS = () => {
    return 0;
  };

  render() {
    return (
      <Animated.View
        style={[{ transform: [{ scale: this.state.scale }] }, this.props.style]}
        accessible={true}
        accessibilityLabel={this.props.accessibilityLabel}
        accessibilityComponentType={this.props.accessibilityComponentType}
        accessibilityTraits={this.props.accessibilityTraits}
        testID={this.props.testID}
        hitSlop={this.props.hitSlop}
        onStartShouldSetResponder={this.touchableHandleStartShouldSetResponder}
        onResponderTerminationRequest={
          this.touchableHandleResponderTerminationRequest
        }
        onResponderGrant={this.touchableHandleResponderGrant}
        onResponderMove={this.touchableHandleResponderMove}
        onResponderRelease={this.touchableHandleResponderRelease}
        onResponderTerminate={this.touchableHandleResponderTerminate}
      >
        {this.props.children}
      </Animated.View>
    );
  }
}
