import React from 'react'
import { DropTarget } from 'react-dnd'
import cn from 'classnames';

import dates from '../../utils/dates';
import BigCalendar from '../../index'

export function getEventTimes({ start, end }, dropDate, type) {
  // Calculate duration between original start and end dates
  const duration = dates.diff(start, end)

  // If the event is dropped in a "Day" cell, preserve an event's start time by extracting the hours and minutes off
  // the original start date and add it to newDate.value
  const nextStart = type === 'dateWrapper'
    ? dates.merge(dropDate, start) : dropDate

  const nextEnd = dates.add(nextStart, duration, 'milliseconds')

  return {
    start: nextStart,
    end: nextEnd
  }
}

const propTypes = {
  connectDropTarget: React.PropTypes.func.isRequired,
  type: React.PropTypes.string,
  isOver: React.PropTypes.bool,
}

class DraggableBackgroundWrapper extends React.Component {
  render() {
    const { connectDropTarget, children, type, isOver } = this.props;
    const BackgroundWrapper = BigCalendar.components[type];

    let resultingChildren = children
    if (isOver)
      resultingChildren = React.cloneElement(children, {
        className: cn(children.props.className, 'rbc-addons-dnd-over')
      })

    return (
      <BackgroundWrapper>
        {connectDropTarget(resultingChildren)}
      </BackgroundWrapper>
    );
  }
}
DraggableBackgroundWrapper.propTypes = propTypes;

DraggableBackgroundWrapper.contextTypes = {
  onEventDrop: React.PropTypes.func,
  dragDropManager: React.PropTypes.object
}

function createWrapper(type) {
  function collectTarget(connect, monitor) {
    return {
      type,
      connectDropTarget: connect.dropTarget(),
      isOver: monitor.isOver()
    };
  }


  const dropTarget = {
    drop(_, monitor, { props, context }) {
      const event = monitor.getItem();
      const { value, resource } = props
      const { onEventDrop } = context

      onEventDrop({
        event,
        ...getEventTimes(event, value, type),
       ...resource && { resource }
      })
    }
  };

  return DropTarget(['event'], dropTarget, collectTarget)(DraggableBackgroundWrapper);
}

export const DateCellWrapper = createWrapper('dateCellWrapper');
export const DayWrapper = createWrapper('dayWrapper');
