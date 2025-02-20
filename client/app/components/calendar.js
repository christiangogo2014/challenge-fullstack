import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { inject as service } from "@ember/service";
import gql from "graphql-tag";

export default class CalendarComponent extends Component {
  @service apollo; 

  @tracked calendar;
  @tracked showBookingForm = false; 
  @tracked bookingDetails = { first_name: "", last_name: "", event_id: null };     
  @tracked currentView = 'timeGridDay'; // Default to Day View


 // GraphQL mutation for creating a booking
  createBookingMutation = gql`
    mutation create_booking($first_name: String!, $last_name: String!, $event_id: ID!) {
      create_booking(first_name: $first_name, last_name: $last_name, event_id: $event_id) {
        first_name
        last_name
        event_id
      }
    }
  `;

  @action
  setupCalendar(element) {
    this.calendar = new Calendar(element, {
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin], 
      initialView: this.currentView,
      events: this.args.events,    
      editable: true, 
      eventClick: this.handleEventClick.bind(this),
    });

    this.calendar.render();
  }

  @action
  handleEventClick(info) {
    this.bookingDetails = {
      first_name: info.event.first_name,
      last_name: info.event.last_name,
      event_id: info.event.id,
    };
    this.showBookingForm = true;
  }

  @action
  async submitBooking(ev) {
    ev.preventDefault();

    try {
      let response = await this.apollo.mutate({
        mutation: this.createBookingMutation,
        variables: {
          first_name: this.bookingDetails.first_name,
          last_name: this.bookingDetails.last_name,
          event_id: this.bookingDetails.event_id,
        },
      });

      let newBooking = response; 
      console.log("New Booking Created:", newBooking);

      this.showBookingForm = false;
      this.bookingDetails = { first_name: "", last_name: "", event_id: null };
    } catch (error) {
      console.error("Error creating booking:", error);
    }

    this.showBookingForm = false;
    this.bookingDetails = {};
  }

  @action
  updateBookingDetails(field, event) {
    this.bookingDetails = { ...this.bookingDetails, [field]: event.target.value };
  }

  @action
  cancelBooking() {
    this.showBookingForm = false;
    this.bookingDetails = {};
  }

  @action
  switchView(viewType) {
    this.currentView = viewType;
    this.calendar.changeView(viewType); // FullCalendar's built-in method
  }

}
