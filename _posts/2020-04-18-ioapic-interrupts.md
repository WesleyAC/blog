---
layout: post
title: "How to set up the APIC to get keyboard interrupts"
description: ""
tags: [kernel]
---

So, you're writing a hobby operating system. It's 64-bit, because what even is the point of a computer if you can't count to 18,446,744,073,709,551,615? You're writing it on x86, because you like sadness and misery. How do you set up the <abbr title="Advanced Programmable Interrupt Controller">[APIC](https://wiki.osdev.org/APIC)</abbr> and <abbr title="Input/Output Advanced Programmable Interrupt Controller">[I/O APIC](https://wiki.osdev.org/IOAPIC)</abbr> to get keyboard interrupts?

I struggled with this a bit, so here's a guide. It doesn't have code, because all of my code is written in a custom dialect of Forth, which won't help you much. It does have all of the steps, because figuring that out is the hard part.

First, I'll assume that you're in protected mode, you have a valid <abbr title="Global Descriptor Table">[GDT](https://wiki.osdev.org/GDT)</abbr>, and a valid <abbr title="Interrupt Descriptor Table">[IDT](https://wiki.osdev.org/IDT)</abbr> with at least one working <abbr title="Interrupt Service Routine">[ISR](https://wiki.osdev.org/ISR)</abbr>. You should be able to trigger an <abbr title="Interrupt Request">[IRQ](https://wiki.osdev.org/IRQ)</abbr> with the `int` instruction and have something happen.

Here's how setting up the <abbr title="Advanced Programmable Interrupt Controller">APIC</abbr> goes:

1. Disable the <abbr title="Programmable Interrupt Controller">[PIC](https://wiki.osdev.org/PIC)</abbr>.
  * Remap the <abbr title="Programmable Interrupt Controller">PIC</abbr>, so that its interrupts start at `0x20`. We do this so that in the case that there are spurious interrupts, they don't get in our way.
  * Mask off all <abbr title="Interrupt Request">IRQ</abbr>s.
  * [This page](https://web.archive.org/web/20140628205356/www.acm.uiuc.edu/sigops/roll_your_own/i386/irq.html) has instructions for interacting with the PIC - disabling it looks the same, but the mask is `0xFF` instead of `0xF8`.
2. Depending on the system, you may need to disable PIC mode by writing to the <abbr title="Interrupt Mode Control Register">IMCR</abbr> register. This is unusual on modern systems, but for a correct implementation, read bit 7 of MP feature information byte 2 to check if PIC mode is implemented. [This page](http://zygomatic.sourceforge.net/devref/group__arch__ia32__apic.html) has some instructions for doing this.
3. Configure the "Spurious Interrupt Vector Register" of the Local APIC, being sure to set bit 8 ("APIC Software Enable/Disable"). `0xFF` is a reasonable choice for the spurious vector.
4. Parse the <abbr title="Advanced Configuration and Power Interface">[ACPI](https://wiki.osdev.org/ACPI)</abbr>[^1] tables - specifically, get the <abbr title="Input/Output Advanced Programmable Interrupt Controller">I/O APIC</abbr> address and Local APIC ID out of the <abbr title="Multiple APIC Description Table">[MADT](https://wiki.osdev.org/MADT)</abbr> and read all of the Interrupt Source Override entries - if the IRQ source of any of them is 1, you will need to use the corresponding global system interrupt value when you set up <abbr title="I/O Redirection Table">IOREDTBL</abbr> entry.
5. Configure the IOREDTBL entry in registers `0x12` and `0x13` (unless you need to use a different one, per the above step).
  * Set the vector to whatever your <abbr title="Interrupt Service Routine">ISR</abbr> vector is, deliver mode to fixed (000), destination mode to physical (0), pin polarity to active high (0), trigger mode to edge (0), mask to enabled (0), and set the destination to the Local APIC ID (which you should have from parsing the <abbr title="Multiple APIC Description Table">MADT</abbr>).
  * Beware - the low bits of the entry are in the first register, and the high bits in the second register - the reverse of what you might expect. You should write the vector to `0x12`, and the Local APIC ID to `0x13`.
  * For a correct implementation, make sure to read the current value of the register, overwrite only the bits you care about (keeping the reserved bits as-is), then write that value back. In practice, setting the reserved bits to zero won't cause anything to break on systems I've seen, but you might as well do things right.
6. Enable the APIC by setting the 11th bit of the APIC base <abbr title="Model Specific Register">[MSR](https://wiki.osdev.org/MSR)</abbr> (`0x1B`). This is probably already done for you, but worth checking if things aren't working for you.

Once you've done all this, you should be able to press a key and have your ISR called. Hooray! If you want to be able to receive more than one keypress, write a zero dword to the address `0xfee000b0` at the end of your keyboard interrupt handler.

# Debugging Tips

* GDB can be pretty useful for poking around at memory - it's worth setting up GBD with QEMU so you can poke around - you can pass `-s -S` to qemu (to start the GDB server and to pause the kernel on start, respectively), then start gdb and type `target remote :1234` to connect. See the [OSDev wiki](https://wiki.osdev.org/QEMU#GDB-Stub) for more info :)
* If you're not sure if you're writing to the correct register, try reading from it and seeing if the value you get back makes sense - oftentimes there are default values, and if you're writing to the wrong thing, reading what it is before you try to write can reveal that.
* Work incrementally - it can be good to enable the PIC to check that your ISR works with that before you disable the PIC.
* When in doubt, go to the authoritative documentation - while the OSDev wiki is nice, it is not nearly as complete as the Intel manual, and is often missing information. Reading the Intel manual is a good skill to practice. See the resources section below.
* Hardcoding values at first is fine - if you know that the local APIC ID of your bootstrap processor is always zero, and you know that the IOREDTBL has the destination zeroed by default, you don't need to write the local APIC id at first, you can just leave that register alone. Similarly, if you know you don't have any relevant Interrupt Source Override entries in your MADT, don't worry about handling the case where you do, until you get things working properly without complicating anything.

# Resources

* [Intel Software Developer's Manual](https://www.intel.com/content/dam/www/public/us/en/documents/manuals/64-ia-32-architectures-software-developer-vol-3a-part-1-manual.pdf) - Chapter 10 is the relevant part here.
* [I/O APIC datasheet](https://pdos.csail.mit.edu/6.828/2014/readings/ia32/ioapic.pdf)
* [ACPI Specification](https://uefi.org/sites/default/files/resources/ACPI_5_1release.pdf)

The state of documentation for x86_64 hobbyist operating system development is quite poor compared to 32bit x86, but getting things working is very rewarding - I hope you stick with it!

[^1]: Who the hell decided that <abbr title="Advanced Programmable Interrupt Controller">APIC</abbr> and <abbr title="Advanced Configuration and Power Interface">ACPI</abbr>, two completely different but slightly overlapping things, should have names that are anagrams of each other? Why? What for?
