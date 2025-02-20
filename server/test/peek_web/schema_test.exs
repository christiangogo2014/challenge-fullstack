defmodule PeekWeb.SchemaTest do
  use PeekWeb.ConnCase, async: true

  alias Peek.Events
  alias Peek.Bookings

  @query """
  {
    events {
      title
      start
      duration
    }
  }
  """

  setup do
    event = Events.create_event(%{title: "wine factory", duration: 30, start: ~N[2021-01-01 20:00:00]})

    # Create bookings related to the event
    Bookings.create_booking(event.id, %{first_name: "John", last_name: "Doe"})
    Bookings.create_booking(event.id, %{first_name: "Jane", last_name: "Smith"})

    {:ok, event: event}
  end

  test "returns all events", context do
    %{conn: conn, event: event} = context
    conn = post(conn, "/api", query: @query)

    assert json_response(conn, 200) == %{
             "data" => %{
               "events" => [
                 %{
                   "duration" => event.duration,
                   "start" => "2021-01-01T20:00:00",
                   "title" => event.title
                 }
               ]
             }
           }
  end

  test "returns accepted booking", context do
    %{conn: conn, event: event} = context
    event_id = to_string(event.id)
    mutation = """
    mutation CreateBooking {
      create_booking(first_name: "John", last_name: "Doe", event_id: "#{event_id}") {
        id
        first_name
        last_name
        event_id
      }
    }
    """
    conn = post(conn, "/api", %{query: mutation})

    assert %{
           "data" => %{
             "create_booking" => %{
               "id" => _id,  # Ignore ID validation
               "first_name" => "John",
               "last_name" => "Doe",
               "event_id" => ^event_id
             }
           }
         } = json_response(conn, 200)
  end

  test "fetches bookings by event_id", context do
    %{conn: conn, event: event} = context

    query = """
    query GetBookingsByEventId($event_id: ID!) {
      get_bookings_by_event_id(event_id: $event_id) {
        id
        first_name
        last_name
        event_id
      }
    }
    """
    variables = %{event_id: to_string(event.id)}
    conn = post(conn, "/api", %{query: query, variables: variables})


    assert json_response(conn, 200)
    response = json_response(conn, 200)

    assert %{
             "data" => %{
               "get_bookings_by_event_id" => bookings
             }
           } = response

    assert length(bookings) == 2
  end
end
