management webapp must be activated
user must be tagged as administrator to log in management interface

messages are routed to the correct queues thanks to exchanges (mailman)
each queue is binded to a particular exchange
each queue must have a routing key (address)