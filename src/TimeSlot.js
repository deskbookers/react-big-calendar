import React, { PropTypes, Component } from 'react'
import cn from 'classnames'
import { elementType } from './utils/propTypes'
import { dateIsInBusinessHours } from './utils/helpers'


export default class TimeSlot extends Component {
  static propTypes = {
    dayWrapperComponent: elementType,
    value: PropTypes.instanceOf(Date).isRequired,
    isNow: PropTypes.bool,
    showLabel: PropTypes.bool,
    content: PropTypes.string,
    culture: PropTypes.string,
    resource: PropTypes.string,
    isGutter: PropTypes.bool,
    businessHours: PropTypes.any
  }

  static defaultProps = {
    isNow: false,
    showLabel: false,
    content: ''
  }

  render() {
    const { resource, value, businessHours } = this.props;
    const Wrapper = this.props.dayWrapperComponent;
    const inBusinessHours = dateIsInBusinessHours(value, businessHours)
    const isDisabled = businessHours.length > 0 ? !inBusinessHours : false;

    const styles = !this.props.isGutter && inBusinessHours ? { backgroundColor: inBusinessHours.color } : {}

    return (
      <Wrapper value={value} resource={resource}>
        <div
          className={cn(
            'rbc-time-slot',
            this.props.showLabel && 'rbc-label',
            this.props.isNow && 'rbc-now',
            !this.props.isGutter && isDisabled && 'rbc-disabled'
          )}
          style={styles}
        >
        {this.props.showLabel &&
          <span>{this.props.content}</span>
        }
        </div>
      </Wrapper>
    )
  }
}
