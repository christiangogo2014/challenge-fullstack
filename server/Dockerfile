FROM elixir:latest

RUN apt-get update && \
  apt-get install -y postgresql-client

RUN mkdir /app
COPY . /app
WORKDIR /app

# Install hex package manager
RUN mix local.hex --force

# I needed to run the compilation process from scratch first to create the library cache. After that, 
# I was able to use .:/app as a volume; otherwise, the files were not modified during the container's 
# lifecycle. This approach made development run smoothly.
# CMD ["tail", "-f", "/dev/null"]

# Compile the project
RUN mix deps.get --force
RUN mix local.rebar --force
RUN mix do compile
# 
RUN chmod +x /app/entrypoint.sh
CMD ["/app/entrypoint.sh"]