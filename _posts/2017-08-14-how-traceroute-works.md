---
layout: post
title: "How traceroute works"
description: "Implementing traceroute in 23 lines of python"
tags: [networking, bestof]
---

When you send a packet on the internet, what happens to it? This is a surprisingly difficult question to answer - from the perspective of a developer, you tell the OS that you want a packet to go to a specific machine, and a few hundred milliseconds later, you get a response from that machine. The mechanism that lets that happen though, is incredibly complicated. Since your computer is likely not directly connected to the computer that you want to contact, your packet must get routed over a path that will take it to the machine you want to connect to. While routing is a very interesting problem, it's not the one that I'm going to talk about in this post - instead, I'm going to explain how you can figure out what route packets that you send are taking.

The question of what route a packet is taking through the network is actually quite difficult - each router only knows where the packet came from, what it's final destination is, and where it sent the packet to, so no node has the complete information of where the packet is travelling. Given this, how might we find out what path the packet is taking?

The way that this is done is by using the time to live (TTL) field of the packet you're sending. Each time a packet is forwarded to a new router (called a "hop"), the router decrements the TTL of the packet. If the TTL reaches zero, then the router sends a response to the original machine saying that the TTL was exceeded, and doesn't forward the packet on. Knowing this, we can send a series of packets (usually UDP packets, but sometimes TCP or ICMP), starting from a TTL of 1 and incrementing the TTL each time, so that each router in the chain will send us a message saying that the TTL has expired. This is what `traceroute` does:

```
$ traceroute wesleyac.com
traceroute to wesleyac.com (192.64.119.124), 30 hops max, 60 byte packets
 1  gateway.net.recurse.com (10.0.0.1)  3.803 ms  8.466 ms  8.455 ms
 2  207.251.103.45 (207.251.103.45)  8.218 ms  8.236 ms  8.142 ms
 3  te0-7-0-18.ccr21.jfk04.atlas.cogentco.com (38.104.73.241)  8.302 ms  8.566 ms  8.491 ms
 4  telia.jfk04.atlas.cogentco.com (154.54.11.110)  13.512 ms  13.456 ms  13.508 ms
 5  nyk-bb3-link.telia.net (80.91.248.173)  8.177 ms nyk-bb4-link.telia.net (62.115.123.58)  8.236 ms nyk-bb4-link.telia.net (62.115.138.190)  8.218 ms
 6  las-b24-link.telia.net (62.115.138.101)  93.737 ms  90.015 ms  99.226 ms
 7  incapsula-ic-306837-las-b3.c.telia.net (62.115.45.234)  83.381 ms  83.371 ms  83.365 ms
 8  172.20.0.198 (172.20.0.198)  83.382 ms  83.521 ms  83.476 ms
 9  172.22.0.2 (172.22.0.2)  112.526 ms  112.434 ms  112.432 ms
10  172.22.0.10 (172.22.0.10)  84.976 ms  83.413 ms  84.974 ms
11  192.64.119.124 (192.64.119.124)  84.876 ms  79.601 ms  80.544 ms
```

The first line tells us that we're sending packets that are 60 bytes long, and that if we haven't gotten to the server that we want in 30 hops, we'll just give up. The next lines are each one router in the chain. Each line shows us:

* The TTL (effectively which router in the chain it is)
* The DNS address for the router
* The IP address of the router
* The time it took to get a response (there are three times because traceroute sends out three packets by default, both for redundancy and to give you an idea of the consistency of the time that the hop takes)

This might seem complicated, but it's actually pretty simple to implement:

```python
def trace(dest, max_hops=30, packet_size=60, port=33434):
    dest_addr = socket.gethostbyname(dest)
    ttl = 1
    curr_addr = None

    send_socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    recv_socket = socket.socket(socket.AF_INET, socket.SOCK_RAW, socket.getprotobyname('icmp'))
    recv_socket.bind(('', port))

    while curr_addr != dest_addr and ttl < max_hops:
        send_socket.setsockopt(socket.SOL_IP, socket.IP_TTL, ttl)
        send_socket.sendto(bytes(packet_size), (dest, port))

        try:
            curr_addr = recv_socket.recvfrom(512)[1][0]
            print('{:2d}\t{}'.format(ttl, curr_addr))
        except socket.error:
            print('{:2d}\t*'.format(ttl))

        ttl += 1

    send_socket.close()
    recv_socket.close()
```

At it's core, this is pretty simple: just a while loop that sends out packets with incrementing TTL values and prints out the IP addresses of the responses. That's all traceroute is doing when it's telling you the route to a host.

I think that traceroute is quite a clever trick to find the route to a specific host, and it's fascinating to see that it can be implemented in such a small amount of code.




*Thanks to Christian Ternus, Marcus Klaas de Vries, Ryan Riddle, and Dan Luu for comments/feedback/discussion.*
