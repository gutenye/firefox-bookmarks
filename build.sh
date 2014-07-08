#!/usr/bin/env bash

# ./build.sh xpi

cfx() {
	python2 /home/guten/dev/src/firefox/addon-sdk/bin/cfx -p ~/.mozilla/firefox/dev2 "$@"
}

case "$1" in
	watch ) coffee -cw lib data ;;
	run )  DEBUG=1 cfx run ;;
	* ) cfx "$@" ;;
esac
