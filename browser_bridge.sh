#!/usr/bin/env bash
# One privileged action: expose the Chrome you already have at the path that
# Playwright and the DevTools bridge expect (/opt/google/chrome/chrome).
# After this, I can drive a browser window on your desktop.

REAL="/home/musaahmedml/.local/opt/google-chrome/opt/google/chrome/chrome"

echo "=================================================================="
echo "   BROWSER BRIDGE SETUP"
echo "=================================================================="
echo
echo "   Chrome is already installed at:"
echo "     $REAL"
echo
echo "   I need one privileged line so the automation tools can find it"
echo "   at /opt/google/chrome/chrome. You will be asked for your password."
echo
echo "------------------------------------------------------------------"
echo
# BOTH steps must run under sudo. If only the mkdir is privileged, /opt/google
# ends up root-owned and the unprivileged ln cannot write inside it.
sudo mkdir -p /opt/google && sudo ln -sfn "$REAL" /opt/google/chrome/chrome
RC=$?
echo
echo "------------------------------------------------------------------"
echo
if [ $RC -eq 0 ] && [ -e /opt/google/chrome/chrome ]; then
  echo "   DONE. /opt/google/chrome/chrome now points at your Chrome."
  echo "   Close this window. A Chrome window will open shortly and I"
  echo "   will take it from there."
else
  echo "   NOT DONE. If you saw an error above, close this window and"
  echo "   tell opencode what it said."
fi
echo "=================================================================="
echo
echo -n "  press Enter to close : "
read -r _
