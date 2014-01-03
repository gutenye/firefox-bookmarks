#!/usr/bin/env bash

case "$1" in
	watch ) coffee -cw lib data ;;
	run )  DEBUG=1 python2 /home/guten/dev/src/firefox/addon-sdk/bin/cfx -p ~/.mozilla/firefox/dev2 run ;;
esac
