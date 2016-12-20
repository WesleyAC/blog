---
layout: post
title: Setting up Alpine + GMail with Arch Linux
description: Fun with custom compiling Alpine!
tags: [linux, google]
---
I just set up alpine and made it play nice with GMail.  All of the other guides that I found were outdated or didn't work for me for one reason or another.

First, enable IMAP through GMail's settings.  Go to Settings -> Forwarding and POP/IMAP and check "Enable IMAP".

One hitch that I ran into that you should know early is if you want alpine to save your password for you.  By default, Arch's version of alpine doesn't save your password, and you need to compile in support for it.  I use 2 factor authentication with GMail, so I want it to remember my password for me (without having to worry about that ungodly long app password).  To do this, you'll need to <a href="https://wiki.archlinux.org/index.php/Arch_Build_System#How_to_use_ABS">set up ABS</a> if you haven't already.  Then, execute the following commands:

```
sudo abs extra/re-alpine
cp -R /var/abs/extra/re-alpine ./
vim re-alpine/PKGBUILD
```

Then, change the `--without-passfile` to `--with-passfile=.pine-passfile`

and build and install it as normal.

Now that you've installed alpine, run it for the first time.  It should pop up with a screen that only shows up the first time.  Press **E** to close it.  Next type **S**etup -> **L**ists -> **A**dd.  (Just type the bold letters, if you hadn't figured that out.)

For the nickname, put whatever you want.  I used "gmail".  For the server, type:

```
imap.gmail.com/ssl/user=YOURUSERNAME@gmail.com
```

Then, use ^X to save.  It'll ask you for your password.  Type it in.  If you use 2 factor authentication, you'll need to <a href="https://accounts.google.com/b/0/SmsAuthSettings#asps">make an app password</a>.

Once you've set all that up, hit **E** to exit setup.

Next, you'll want to finish configuring it.  Type **S**etup -> **C**onfigure to enter the configuration menu.  You'll want to change the following values:

```
SMTP server: smtp.gmail.com/novalidate-cert/user=USERNAME@GMAIL.COM/ssl
Inbox Path: imap.gmail.com/novalidate-cert/ssl/user=YOURUSERNAME@gmail.com
```

When you change your inbox path, it'll ask you what inbox folder you want.  Just type "INBOX".

Hit **E**, and you're all done!

If you want alpine to remember your password, just execute:

```
touch .pine-passfile
```

on the command line.  Next time you start pine, it'll ask you for you password.  Once you enter your password, it'll ask you if you want to save it.  Answer yes, and alpine won't bother you about you password again!

This post is mostly for future me, but if it helped you, then I'm glad :)
