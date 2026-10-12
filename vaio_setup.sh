#!/usr/bin/env bash
# One-shot VAIO key authorisation.
# You type exactly two things: the login username, and the SSH password.
PUBKEY='ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIL3iRi1ZybG9J6QQUYyt7Ji6RKwRLczOhZ2z8NHspX0D musaahmedml@musaahmedml-Lillipup'

line() { printf '%s\n' "------------------------------------------------------------------"; }

echo
echo "=================================================================="
echo "   VAIO ACCESS SETUP   -   Ahmed Academy motion render farm"
echo "=================================================================="
echo
echo "   YOU WILL TYPE 2 THINGS:"
echo "     (1) the login username for the VAIO"
echo "     (2) your SSH password"
echo
line

echo
echo "  STEP 1 of 2  -  which machine is the VAIO ?"
echo
echo "     1  =  192.168.1.103      (LAN address)"
echo "     2  =  100.65.196.110     (Tailscale - this one runs Jellyfin)"
echo
echo -n "     >>> PRESS 1 OR 2 THEN ENTER : "
read -r CHOICE
if [ "$CHOICE" = "1" ]; then HOST=192.168.1.103; else HOST=100.65.196.110; fi
echo
echo "     using host: $HOST"
line

RC=1
for TRY in 1 2 3; do
  echo
  if [ $TRY -eq 1 ]; then
    echo "  STEP 2 of 2  -  your login username on $HOST"
  else
    echo "  That did not authenticate. Try again (attempt $TRY of 3)."
    if [ -z "${USER:-}" ]; then
      echo "  Type the username, then the password."
    fi
  fi
  echo "     (on Windows it is often:  vaio  /  sony  /  your windows login name)"
  echo
  echo -n "     >>> TYPE USERNAME THEN ENTER : "
  read -r USER
  [ -z "$USER" ] && USER=musa

  echo
  echo "     ----------------------------------------------------------------"
  echo "      >>> NOW TYPE YOUR SSH PASSWORD AND PRESS ENTER"
  echo "          Nothing will appear as you type. That is CORRECT and SAFE."
  echo "          It is hidden on purpose. Just type it and press Enter."
  echo "     ----------------------------------------------------------------"
  echo
  ssh -o StrictHostKeyChecking=accept-new -o ConnectTimeout=25 "$USER@$HOST" \
    "mkdir -p ~/.ssh && chmod 700 ~/.ssh && { grep -qF '$PUBKEY' ~/.ssh/authorized_keys 2>/dev/null || echo '$PUBKEY' >> ~/.ssh/authorized_keys; }; chmod 600 ~/.ssh/authorized_keys; echo; echo 'REMOTE HOST : '\$(hostname); echo 'CORES       : '\$(nproc); echo 'MEMORY      : '\$(free -g 2>/dev/null | awk '/Mem:/{print \$2}')' GB'; echo 'NODE        : '\$(node --version 2>/dev/null || echo 'not installed'); echo 'FFMPEG      : '\$(ffmpeg -version 2>/dev/null | head -1 || echo 'not installed'); echo; echo 'KEY_INSTALLED_OK'"
  RC=$?
  if [ $RC -eq 0 ]; then break; fi
done

echo
echo "=================================================================="
if [ $RC -eq 0 ]; then
  echo "   SUCCESS. The VAIO now accepts key-based login."
  echo "   Leave this window open for a moment if you want to read the"
  echo "   hardware report, then press Enter to close."
else
  echo "   NOT COMPLETE"
  echo
  echo "   If the username is right but it still failed:"
  echo "     - sshd on the VAIO may have password login switched off"
  echo "     - it may want a different port"
  echo "   Close this window and tell opencode what you saw."
fi
echo "=================================================================="
echo
echo -n "  press Enter to close : "
read -r _
