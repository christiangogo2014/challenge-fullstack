defmodule PeekWeb.SchemaTest do
  use PeekWeb.ConnCase, async: true

  alias Peek.Events

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
    event =
      Events.create_event(%{title: "wine factory", duration: 30, start: ~N[2021-01-01 20:00:00]})

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

  @mutation """
  mutation CreateBooking {
    create_booking(first_name: "John", last_name: "Doe", event_id: "1") {
      id
      first_name
      last_name
      event_id
    }
  }
  """

  test "returns accepted booking", context do
    %{conn: conn, event: event} = context
    conn = post(conn, "/api", %{query: @mutation})
    event_id = event.id


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
end
