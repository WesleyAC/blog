---
layout: post
title: "How to reset the USB stack on Linux"
description: ""
---

I've recently started having issues with the USB stack on my Linux laptop getting itself wedged. Rebooting fixes the problem, but I'd rather not have to reboot, so I looked into ways to reset the USB stack without needing a reboot. Almost all of the answers on the internet about how to do so either do not work on modern Linux systems, or did not reset at low enough of a level to fix the specific problem I was having.

The solution is to unbind and rebind the USB controller to the xHCI driver. First, find the PCI bus number of the misbehaving USB controller, using `lspci -D`. Then, write that bus number to `/sys/bus/pci/drivers/xhci_hcd/unbind`, for instance, by running `echo 0000:00:14.0 | sudo tee /sys/bus/pci/drivers/xhci_hcd/unbind` (replacing `0000:00:14.0` with whatever the PCI bus number you found in the previous step was). This will disable the USB controller. Once you've done that, reenable it by writing the same bus number to `/sys/bus/pci/drivers/xhci_hcd/bind`.

Here's a script that will do that all for you, in case it's useful:

```bash
#!/usr/bin/env bash

set -eo pipefail

DEVICE=$(lspci -Dm | grep "USB controller" | cut -f1 -d' ' | head -n1)

echo $DEVICE > /sys/bus/pci/drivers/xhci_hcd/unbind
echo $DEVICE > /sys/bus/pci/drivers/xhci_hcd/bind
```

You may need to modify the grep for "USB controller", depending on how your USB controller identifies itself.
