---
layout: post
title: "The smallest Hello World executable"
description: "Cheating a bit with linux's binfmt handlers"
tags: [linux, kernel]
---

I quite enjoy code golf, and when I was playing with ELF files a while ago, I came across the [smallest x86 ELF hello world](http://timelessname.com/elfbin/). Finding myself unable to golf it further, I decided to move the goalposts a bit, and attempt to make the smallest hello world linux[^1] executable. Here's what I came up with, in it's 23-byte glory[^2]:

```
#!/bin/cat
Hello World
```

I say "linux executable", because it's actually the kernel's job to parse the hashbang and run the correct program! When you try to `exec` a file, the first thing the kernel does is checks the first few bytes of the file to find out what type of file it is. You can see the code that does this in the linux kernel source in [`fs/exec.c`](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/tree/fs/exec.c?id=4fbd8d194f06c8a3fd2af1ce560ddb31f7ec8323), in the function [`search_binary_handler`](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/tree/fs/exec.c?id=4fbd8d194f06c8a3fd2af1ce560ddb31f7ec8323#n1612). There's a few fun things about this function - the first one is that there's a limit to the number of "binfmt rewrites" you can do - that is, if the interpreter you specify is itself interpreted, there's a limit to how many layers of interpretation you can have. The surprising thing about this limit is how low it is - you can have at most four layers of indirection (I predict that it'll be less than 5 years before you see someone on medium complaining that this ridiculously low limit broke their totally-reasonable, 5-layers of interpretation deep tech stack).

Another interesting thing here is the [call to `security_bprm_check`](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/tree/fs/exec.c?id=4fbd8d194f06c8a3fd2af1ce560ddb31f7ec8323#n1622). If you look at the [implementation in `include/linux/security.h`](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/tree/include/linux/security.h?id=4fbd8d194f06c8a3fd2af1ce560ddb31f7ec8323#n530), you'll see that it always returns zero. This is because it's a LSM (Linux Security Module) hook. LSM is a system that linux uses to allow third party kernel modules to provide access-control features, using information that is available to the kernel. For example, you could write a kernel module to specify a locked-down list of whitelisted interpreters, should you so desire. If you're interested in learning more about LSM, there's some documentation in [`Documentation/admin-guide/LSM/`](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/tree/Documentation/admin-guide/LSM).

Anyway, that's my 23 byte Hello World executable, using a silly hashbang[^3] - and hopefully you learned something new about the linux kernel's binary handling - if this sort of thing interests you, I highly recommend [reading](http://www.cipht.net/2017/10/05/why-read-code.html) the linux kernel source a bit - it's surprisingly approachable (if you know C), and a lot of fun!

[^1]: It actually should run on any POSIX system, making it much more portable than the ELF one ;)

[^2]: If you're a pendant who cares that it outputs the hashbang, then replace `cat` with `tail -n1` - at the grave cost of 4 bytes...

[^3]: Among other fun hashbangs is `#!/bin/rm` for self-destructing files.
