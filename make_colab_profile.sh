#!/usr/bin/env bash
# Build a minimal Chrome profile that keeps the Google session but drops the
# 4.6GB of cache the real profile carries. Only the files needed for auth and
# page rendering are copied, so this takes seconds instead of minutes.
set -e
SRC="/home/musaahmedml/.config/chrome-cdp"
DST="/home/musaahmedml/chrome-colab-profile"

rm -rf "$DST"; mkdir -p "$DST/Default"

# Chrome refuses to open a profile without Local State (encryption key holder).
cp "$SRC/Local State" "$DST/Local State" 2>/dev/null || true

for f in Cookies "Login Data" "Web Data" "History" "Preferences" "Secure Preferences" \
         "Local Storage" "Session Storage" "Network" "Sessions"; do
  [ -e "$SRC/Default/$f" ] && cp -r "$SRC/Default/$f" "$DST/Default/" 2>/dev/null || true
done
mkdir -p "$DST/Default/IndexedDB" "$DST/Default/Service Worker" 2>/dev/null || true
cp -r "$SRC/Default/IndexedDB"/* "$DST/Default/IndexedDB/" 2>/dev/null || true
cp -r "$SRC/Default/Service Worker"/* "$DST/Default/Service Worker/" 2>/dev/null || true

echo "profile prepared:"
du -sh "$DST"
