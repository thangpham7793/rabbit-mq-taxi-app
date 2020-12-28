#!/bin/bash

rabbitmqctl set_policy \
--vhost cc-dev-vhost \
--apply-to queues \
Q_TTL_DLX \
"taxi\.\d+" \
'{"message-ttl": 604800000, "dead-letter-exchange": "taxi-dlx"}'