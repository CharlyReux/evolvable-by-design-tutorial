#!/bin/bash
if [ -n "$CODESPACES" ]; then
    gh codespace ports visibility 3000:public -c $CODESPACE_NAME > /dev/null 2>&1
    
fi
