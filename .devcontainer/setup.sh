#!/bin/bash
# After 5 seconds, turn Vite port to public and show no command output on CLI
sleep 5
if [ -n "$CODESPACES" ]; then
    gh codespace ports visibility 3000:public -c $CODESPACE_NAME > /dev/null 2>&1
fi
#
# This script is intended to be used only in Browser cloud environment,
# because of a issue involving bad handled preflight requests when
# the port is private from Github and Gitpod parts.
# @see https://github.com/community/community/discussions/15351