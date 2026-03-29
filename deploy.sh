#!/usr/bin/env bash
set -euo pipefail

cp /home/site/wwwroot/.docker/conf/nginx/nginx.conf /etc/nginx/sites-available/default

nginx -t
service nginx reload

cd /home/site/wwwroot
composer run-script deploy