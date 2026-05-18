import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { MatButton } from '@angular/material/button';
import { Booking } from '../../../shared/booking';
import { BookingStore } from '../../../shared/services/booking-store';
import { DatePipe } from '@angular/common';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'fa-booking-list',
  standalone: true,
  imports: [
    RouterLink,
    MatCard,
    MatCardContent,
    MatCardTitle,
    MatButton,
    MatIcon,
    DatePipe
  ],
  templateUrl: './booking-list.html',
  styleUrl: './booking-list.scss'
})
export class BookingList {
  // Use the booking store to load and update bookings.
  private bookingStore = inject(BookingStore);

  // Store the currently loaded bookings in a signal, so Angular
  // automatically updates the template whenever the booking data changes
  bookings = signal<Booking[]>([]);

  constructor() {
    // Load the bookings when the component is created.
    this.loadBookings();
  }

  /**
   * Load all bookings of the currently authenticated user.
   */
  loadBookings(): void {
    //service sends a GET request to the backend get all bookings for one user
    this.bookingStore.getAll().subscribe({
      // If the request is successful, the returned bookings are written into the signal.
      // Automatically update the UI (because it's a signal)
      next: (bookings) => {
        this.bookings.set(bookings);
      },
      // request failed
      error: (error) => {
        console.error('Loading bookings failed', error);
      }
    });
  }

  /**
   * Cancel one booking after user confirmation.
   * Reload the list after a successful cancellation.
   */
  cancelBooking(bookingId: number): void {
    // Ask for confirmation
    const confirmed = confirm('Do you really want to cancel this booking?');

    if (confirmed) {
      //service sends a PUT request to the backend to change the booking status
      this.bookingStore.cancel(bookingId).subscribe({
        next: () => {
          // Reload bookings after the cancellation was successful
          this.loadBookings();
        },
        // cancellation failed
        error: (error) => {
          console.error('Cancelling booking failed', error);
        }
      });
    }
  }
}
