import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';

export default class CalendarComponent extends Component {

  @tracked calendar;
  @tracked currentView = 'timeGridDay'; // Default to Day View

  @action
  setupCalendar(element) {
    this.calendar = new Calendar(element, {
      plugins: [dayGridPlugin, timeGridPlugin], 
      initialView: this.currentView,
      events: this.args.events,    
      editable: true, 
    });

    this.calendar.render();
  }

}
