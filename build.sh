#!/usr/bin/env bash

# run dev: ./build run
# build dist: ./build.sh xpi

cfx() {
	cfx -p ~/.mozilla/firefox/dev2 "$@"
}

case "$1" in
	run )  DEBUG=1 cfx run ;;
	* ) cfx "$@" ;;
esac
