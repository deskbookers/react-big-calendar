import React, { PropTypes } from 'react';
import classes from 'dom-helpers/class';
import getWidth from 'dom-helpers/query/width';
import scrollbarSize from 'dom-helpers/util/scrollbarSize';

import { notify } from './utils/helpers';
import localizer from './localizer'
import message from './utils/messages';
import dates from './utils/dates';
import { navigate } from './utils/constants';
import { accessor as get } from './utils/accessors';
import { accessor, dateFormat, dateRangeFormat } from './utils/propTypes';
import { inRange } from './utils/eventLevels';


let Agenda = React.createClass({

  propTypes: {
    events: React.PropTypes.array,
    date: React.PropTypes.instanceOf(Date),
    length: React.PropTypes.number.isRequired,
    titleAccessor: accessor.isRequired,
    allDayAccessor: accessor.isRequired,
    startAccessor: accessor.isRequired,
    endAccessor: accessor.isRequired,

    onSelectEvent: React.PropTypes.func,
    agendaDateFormat: dateFormat,
    agendaTimeFormat: dateFormat,
    agendaTimeRangeFormat: dateRangeFormat,
    culture: React.PropTypes.string,

    components: React.PropTypes.object.isRequired,
    messages: PropTypes.shape({
      date: PropTypes.string,
      time: PropTypes.string,
    })
  },

  getDefaultProps() {
    return {
      length: 30
    };
  },

  componentDidMount() {
    this._adjustHeader()
  },

  componentDidUpdate() {
    this._adjustHeader()
  },

  render() {
    let { date, events, startAccessor, components } = this.props;
    let messages = message(this.props.messages);

    let { start, end } = Agenda.range(date, this.props);

    let range = dates.range(start, end, 'day');

    events = events.filter(event =>
      inRange(event, start, end, this.props)
    )

    events.sort((a, b) => +get(a, startAccessor) - +get(b, startAccessor))

    return (
      <div className='rbc-agenda-view'>
        <table ref='header'>
          <thead>
            <tr>
              <th className='rbc-header' ref='dateCol'>
                {messages.date}
              </th>
              <th className='rbc-header'>
                {messages.event}
              </th>
            </tr>
          </thead>
        </table>
        <div className='rbc-agenda-content' ref='content'>
          {events.length > 0 ?  <table>
              <tbody ref='tbody'>
                { range.map((day, idx) => this.renderDay(day, events, idx)) }
              </tbody>
            </table>
            : components.emptyComponent()
          }
        </div>
      </div>
    );
  },

  onRowClick(event) {
    notify(this.props.onSelectEvent, event)
  },

  renderDay(day, events, dayKey){
    let {
        culture, components
      , titleAccessor, agendaDateFormat } = this.props;

    let EventComponent = components.event;

    events = events.filter(e => inRange(e, day, day, this.props))

    return events.map((event, idx) => {
      let dateLabel = localizer.format(day, agendaDateFormat, culture)

      let title = get(event, titleAccessor)

      return (
        <tr key={dayKey + '_' + idx} onClick={this.onRowClick.bind(this, event)}>
          <td className='rbc-agenda-date-cell'>
            {dateLabel}
            <br />
            { this.timeRangeLabel(day, event) }
          </td>
          <td className='rbc-agenda-event-cell'>
            { EventComponent
                ? <EventComponent event={event} title={title}/>
                : title
            }
          </td>
        </tr>
      )
    }, [])
  },

  timeRangeLabel(day, event){
    let {
        endAccessor, startAccessor, allDayAccessor
      , culture, messages, components } = this.props;

    let labelClass = ''
      , TimeComponent = components.time
      , label = message(messages).allDay

    let start = get(event, startAccessor)
    let end = get(event, endAccessor)

    if (!get(event, allDayAccessor)) {
      if (dates.eq(start, end, 'day')){
        label = localizer.format({ start, end }, this.props.agendaTimeRangeFormat, culture)
      }
      else if (dates.eq(day, start, 'day')){
        label = localizer.format(start, this.props.agendaTimeFormat, culture)
      }
      else if (dates.eq(day, end, 'day')){
        label = localizer.format(end, this.props.agendaTimeFormat, culture)
      }
    }

    if (dates.gt(day, start, 'day')) labelClass = 'rbc-continues-prior'
    if (dates.lt(day, end, 'day'))   labelClass += ' rbc-continues-after'

    return (
      <span className={labelClass.trim()}>
        { TimeComponent
          ? <TimeComponent event={event} label={label}/>
          : label
        }
      </span>
    )
  },

  _adjustHeader() {
    let header = this.refs.header;
    let firstRow = this.refs.tbody && this.refs.tbody.firstChild

    if (!firstRow)
      return

    let isOverflowing = this.refs.content.scrollHeight > this.refs.content.clientHeight;
    let widths = this._widths || []

    this._widths = [
      getWidth(firstRow.children[0]),
      getWidth(firstRow.children[1])
    ]

    if (widths[0] !== this._widths[0] || widths[1] !== this._widths[1]) {
      this.refs.dateCol.style.width = this._widths[0] + 'px'
    }

    if (isOverflowing) {
      classes.addClass(header, 'rbc-header-overflowing')
      header.style.marginRight = scrollbarSize() + 'px'
    }
    else {
      classes.removeClass(header, 'rbc-header-overflowing')
    }
  }
});

Agenda.navigate = (date, action)=>{
  switch (action){
    case navigate.PREVIOUS:
      return dates.add(date, -1, 'week');

    case navigate.NEXT:
      return dates.add(date, 1, 'week')

    default:
      return date;
  }
}

Agenda.range = (date, { culture }) => {
  let firstOfWeek = localizer.startOfWeek(culture)
  let start = dates.startOf(date, 'week', firstOfWeek)
  let end = dates.endOf(date, 'week', firstOfWeek)

  return { start, end }
}

export default Agenda
