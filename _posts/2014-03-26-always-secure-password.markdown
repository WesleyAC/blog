---
layout: post
title: Always-Secure Password
description: A theoretical system for entering a password on a compromised system
tags: [security]
hide: true
---
<p>Recently, I was thinking about how to make a password that is secure,no matter where you enter it.  The idea is to make a password that I can enter on someone else's computer, and have them not be able to log in, even if they have a keylogger (Or some other way to see your password.).</p>
<p>Think about that for a bit...</p>
<p>Here's my solution:</p>
<p>Every time the user enters their password, you log them in, and change their password according to some function only known by the user. Next time they try to log in, the old password won't work, and they will need to instead log in with the (mentally calculated) new password.</p>
<p>Here's an example:</p>
<pre>Login #1: mypassword
Login #2: nasexydwan
Login #3: ocvicekejx
Login #4: peymhkrmsh
Login #5: qgbqmqyubr
Login #6: rieurwfckb</pre>
<p>Can you guess any one of the passwords from the previous one?  If you're having trouble, here's the script that I used to generate those:</p>
<pre>pwd = "mypassword"
n = 1
fpwd = ""

for i in range(5):
    for i in pwd:
        fpwd = fpwd + chr(((ord(i)+n-97)%26)+97)
        n = n + 1

    print(fpwd)
    pwd=fpwd
    fpwd=""
    n=1</pre>
<p>It increases the value of each character by the value that it increased the previous character by + 1.</p>
<p>This has a couple of disadvantages:</p>
<ul>
<li>The passwords are hard to remember, and you need to know either the iteration number or the old password to calculate the new password.  However, you can write down the old password, so that makes it a bit better.  Still most people that I know would get pissed off by a system like this.</li>
<li>With enough data, you can calculate the "secret" function.  If you're good with patterns, you might be able to see the function that was used.  You do, however, need to know the iteration numbers of all the passwords that were entered.</li>
<li>You can no longer use hashes, because you need to know the old password.  Again, you can negate this by when the user logs in, if their password matches a hash, use the (plaintext) password that they just entered to calculate the hash of the new password.</li>
</ul>
<p>There is one solution that I can think of that negates both of those problems:  Have the password be picked from a predefined list.  That helps with point one, because you get to directly choose the new password (although, still, most people I know use a single password for most account, so this is arguable.)  It helps with point two, because each password is "random".  And it helps with point three, because you can store the hashes, due to not needing the old password to calculate the new one.  The problem with this idea is that there is a finite list of possible passwords, so someone can set up script/etc to try all know passwords until it hits a window of time where the password has that value.  You can make the list of passwords bigger, but that has the problem of a finite human memory.</p>
<p>&nbsp;</p>
<p>Anyways, neither of these things would be ideas that I want to use, but it's interesting to think about.</p>
