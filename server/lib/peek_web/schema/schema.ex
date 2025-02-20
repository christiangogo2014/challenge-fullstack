defmodule PeekWeb.Schema.Schema do
  @moduledoc """
  GraphQL Schema for bookings and events.
  """
  use Absinthe.Schema

  import_types(Absinthe.Type.Custom)

  alias PeekWeb.Resolvers.EventResolver
  alias PeekWeb.Resolvers.BookingResolver

  #
  # Queries
  #
  query do
    @desc "Get a list of events"
    field :events, list_of(:event) do
      resolve(&EventResolver.events/3)
    end

    @desc "Get a list of bookings by a given event_id"
    field :get_bookings_by_event_id, list_of(:booking) do
      arg :event_id, non_null(:id)
      resolve(&BookingResolver.get_bookings/3)
    end
  end

  #
  # Mutations
  #
  mutation do
    field :create_booking, :booking do
      arg :first_name, non_null(:string)
      arg :last_name, non_null(:string)
      arg :event_id, non_null(:id)

      resolve &BookingResolver.create_booking/3
    end
  end

  #
  # Event Object
  #
  object :event do
    field :id, non_null(:id)
    field :start, non_null(:naive_datetime)
    field :duration, non_null(:integer)
    field :title, non_null(:string)

    field :bookings, non_null(list_of(non_null(:booking))), resolve: &BookingResolver.get_bookings/3
  end

  #
  # Booking Object
  #
  object :booking do
    field :id, non_null(:id)
    field :first_name, non_null(:string)
    field :last_name, non_null(:string)
    field :event_id, non_null(:id)
  end

end
