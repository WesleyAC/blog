---
layout: post
title: "Recursive Filesystem Entries"
description: "Abusing FAT for fun and profit"
tags: [software]
---

I made a fun file today:

```
$ df -h
Filesystem      Size  Used Avail Use% Mounted on
...
/dev/loop0      232K   22K  210K  10% /mnt/test
$ ls -lh /mnt/test/
total 4.0G
-rwxr-xr-x 1 root root 4.0G Aug 28 04:05 forever.txt
$ cat /mnt/test/forever.txt | wc -c
4294967295
```

`forever.txt` is a 4GB file sitting on a 232K filesystem - and it doesn't just say it's 4GB in size, it actually has 4GB of data. How does that work?

In order to understand this, we need to take a step back and look at how filesystems store data. Filesystems are often divided into small "clusters" (typically anywhere from 512B - 64KB in size). One of the jobs of a filesystem is to transform a file name into a list of clusters containing the data in that file. [FAT](https://en.wikipedia.org/wiki/File_Allocation_Table) does this with a linked list structure - for each cluster, the File Allocation Table keeps the number of the next cluster in the same file.

If we [create a FAT filesystem](http://fejlesztek.hu/create-a-fat-file-system-image-on-linux/) and put some files on it, we can open it in a hex editor and see what's going on. The first 512 bytes are the boot sector - immediately after the boot sector is the File Allocation Table[^1]:

```
00000200: f8ff ff00 4000 0560 0007 8000 09a0 000b  ....@..`........
00000210: c000 0df0 ff00 0000 0000 0000 0000 0000  ................
```

The File Allocation Table is essentially a flat array of pointers to the next block in a file. Since I'm using FAT12, each entry in the FAT is 12 bits. There are a few special values:

* `0x000` is an unused block
* `0xFF0` - `0xFF6` is a reserved cluster
* `0xFF7` is a bad cluster
* `0xFF8` - `0xFFF` is the last cluster in a file

Since there are 8 bits in a byte, and we have 12 bit values, we pack 2 values in every three bytes. This is done in a somewhat non-intuitive way: if we have the three bytes `0xABCDEF`, then our two values are `0xDAB` and `0xEFC`.

Knowing this, we can easily decipher our FAT:

```
FF8 FFF 000 004 005 006 007 008 009 00A 00B 00C 00D FFF
```

This shows that we have 3 files: two small (≤ 1 cluster) files and one 12 cluster file.[^2]

At this point, it should be fairly simple to see how I made that 4GB file from the beginning - simply change the last `0xFFF` to `0x003`, and instead of being a linked list, it's now a graph with a cycle. However, there's one more thing that has to be done - the filesystem still knows the size of the old file, since that's saved in the directory entry. Let's look at the directory entry in our hex editor:

```
00000600: 4166 006f 0072 0065 0076 000f 0035 6500  Af.o.r.e.v...5e.
00000610: 7200 2e00 7400 7800 7400 0000 0000 ffff  r...t.x.t.......
00000620: 464f 5245 5645 5220 5458 5420 0064 a440  FOREVER TXT .d.@
00000630: 1c4b 1c4b 0000 a440 1c4b 0300 1e50 0000  .K.K...@.K...P..
```

The first two lines are [long filename (LFN)](http://home.teleport.com/~brainy/lfn.htm) entries - since FAT natively only supports 8 character filenames and 3 character extensions, LFNs were added to allow arbitrarily long unicode filenames. The next two lines are the standard filename entry, which contain the filename, modification/creation times, attributes, first cluster number, and file size.

The reason that the filesize needs to be known is that the file may end partway through a cluster, so providing the filesize allows the driver to know where to stop reading the file. Unfortunately, it also means that we can't make the file size infinite, so I'll have to settle for 4GB (the largest possible filesize). The last 4 bytes of the directory entry are the file size, so if we change them to `0xFFFFFFFF`, we get a 4GB file that only takes up a few KB on disk!

While this is a fun trick, it's not super useful - there isn't really any practical application for this, and FAT is largely obsolete now. However, I hope that this has been a good introduction to how filesystems work - if you're interested in learning more about filesystems, I recommend the later chapters of [the comet book](http://pages.cs.wisc.edu/~remzi/OSTEP/)


[^1]: Actually, two copies of the file allocation table, for redundancy.

[^2]: Interestingly, I only added the 12 sector file - the other two seem to exist in every FAT12 filesystem. I'm not sure what they're for.
