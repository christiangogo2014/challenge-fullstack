defmodule PeekWeb.Resolvers.BookingResolver do
  alias Peek.Bookings
  alias Peek.Events

  def create_booking(_, %{first_name: first_name, last_name: last_name, event_id: event_id}, _) do
    event_id = String.to_integer(event_id)  # Ensure correct type
    
    case Events.get_event(event_id) do
      nil -> 
        # Event not found
        {:error, "Event not found"}
      event -> 
        # If the event exists, create the booking
        case Bookings.create_booking(event.id,%{first_name: first_name, last_name: last_name}) do
          {:ok, booking} -> 
            {:ok, booking}
          {:error, reason} -> 
            {:error, reason}
        end
    end
  end

  def get_bookings(_, _, _) do
    # TODO
    {:ok, nil}
  end
end
