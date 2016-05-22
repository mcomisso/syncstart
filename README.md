# Syncstart
Watching a movie together but remotely?

## Description

This project relies on NodeJS and Socket.io. 
The server generates a random code when a client connects, which will be
used by a second client to fetch the value from a mongodb instance,
and let the socket.io server emit a notification to both.

## Setup

* Install node and npm,
* Run a `npm install` within the cloned folder
* Start with `node bin/www`