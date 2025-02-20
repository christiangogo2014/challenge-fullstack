import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { inject as service } from "@ember/service";
import gql from "graphql-tag";
import getBookingsQuery from 'peek-client/gql/queries/get_bookings.graphql';

export default class CalendarComponent extends Component {
  @service apollo; 

  @tracked calendar;
  @tracked showBookingForm = false; 
  @tracked showBookingsModal = false;
  @tracked bookingDetails = { first_name: "", last_name: "", event_id: null };     
  @tracked event_id = null;
  @tracked bookings = [];
  @tracked currentView = 'timeGridDay'; // Default to Day View


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
    this.event_id = info.event.id;
    this.bookingDetails = {
      first_name: info.event.first_name,
      last_name: info.event.last_name,
      event_id: info.event.id,
    };
    this.fetchBookings()
    this.openBookingsModal()
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
  cancelModals() {
    this.showBookingForm = false;
    this.showBookingsModal = false;    
    this.bookingDetails = {};
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

  // Show the booking form modal
  @action
  openBookingForm() {
    this.showBookingForm = true;
    this.showBookingsModal = false;
  }

// Show the booking form modal
  @action
  openBookingsModal() {
    this.showBookingForm = false;
    this.showBookingsModal = true;
  }

  @action
  async fetchBookings() {
    if (!this.event_id) return;

    try {
        const result = await this.apollo.query({
          query: getBookingsQuery,
          variables: { event_id: this.event_id },
          fetchPolicy: 'network-only', 
        });

        console.log(result)
        this.bookings = result.get_bookings_by_event_id || [];
    } catch (error) {
        console.error("GraphQL Query Error:", error);
        throw error; 
    }
  }

}
