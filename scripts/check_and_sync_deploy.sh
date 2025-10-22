#!/usr/bin/env bash
set -euo pipefail

# check_and_sync_deploy.sh
# Usage: sudo ./check_and_sync_deploy.sh [--apply]
# When run without --apply it only prints diagnostics. With --apply it will rsync dist -> frontend-dist,
# backup the old frontend-dist, chown, nginx -t && systemctl reload nginx, and verify site via curl.

APPLY=false
if [[ "${1-}" == "--apply" ]]; then
  APPLY=true
fi

ROOT=/var/www/site-adm-app
NEW_DIST="$ROOT/frontend/dist"
SERVE_DIR="$ROOT/frontend-dist"
BACKUP_DIR="$ROOT/.backups/frontend-dist-$(date -u +%Y%m%d%H%M%S)"
DOMAIN="meuestagio.itecensino.com.br"

echo "Running diagnostics..."

echo "-- Paths --"
echo "NEW_DIST: $NEW_DIST"
echo "SERVE_DIR: $SERVE_DIR"

echo "-- Existence checks --"
ls -la "$NEW_DIST" || true
ls -la "$SERVE_DIR" || true


echo "-- Grep for token 'Gerenciamento de Alunos' --"
if sudo grep -R --line-number -I "Gerenciamento de Alunos" "$SERVE_DIR" >/dev/null 2>&1; then
  echo "FOUND in serve dir"
  sudo grep -R --line-number -I "Gerenciamento de Alunos" "$SERVE_DIR" | sed -n '1,10p'
else
  echo "NOT FOUND in serve dir"
fi

if sudo grep -R --line-number -I "Gerenciamento de Alunos" "$NEW_DIST" >/dev/null 2>&1; then
  echo "FOUND in new dist"
  sudo grep -R --line-number -I "Gerenciamento de Alunos" "$NEW_DIST" | sed -n '1,10p'
else
  echo "NOT FOUND in new dist"
fi


echo "-- Checksums (index.html) --"
if [[ -f "$NEW_DIST/index.html" ]]; then
  sudo sha1sum "$NEW_DIST/index.html" || true
else
  echo "No index.html in new dist"
fi

if [[ -f "$SERVE_DIR/index.html" ]]; then
  sudo sha1sum "$SERVE_DIR/index.html" || true
else
  echo "No index.html in serve dir"
fi


if [[ "$APPLY" == "true" ]]; then
  echo "-- Applying sync: backing up serve dir to $BACKUP_DIR and rsyncing new dist --"
  sudo mkdir -p "$BACKUP_DIR"
  sudo rsync -av --delete "$SERVE_DIR/" "$BACKUP_DIR/"
  echo "Backup complete. Now rsyncing new build into serve dir..."
  sudo rsync -av --delete "$NEW_DIST/" "$SERVE_DIR/"
  sudo chown -R www-data:www-data "$SERVE_DIR"
  echo "Testing nginx config..."
  sudo nginx -t
  echo "Reloading nginx..."
  sudo systemctl reload nginx
  echo "Waiting 2s for nginx to settle..."
  sleep 2
  echo "-- Remote check via curl --"
  curl -I -L "https://$DOMAIN" | sed -n '1,60p' || true
  echo "-- Content check (search token) --"
  curl -sS "https://$DOMAIN" | grep -m1 -F "Gerenciamento de Alunos" || true
  echo "Sync + reload done. If something is wrong you can restore backup by rsync -av $BACKUP_DIR/ $SERVE_DIR/"
else
  echo "Dry run complete. To apply the sync run: sudo $0 --apply"
fi

exit 0
