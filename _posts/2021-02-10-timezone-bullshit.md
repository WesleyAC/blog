---
layout: post
title: "Timezone Bullshit"
description: ""
---

People often use short timezone abbreviations like EST and PST to refer to timezones. If you're doing this in a computer program, you are almost certainly making a huge mistake. Let's take take a look, using the disastrously bad [unix libc timezone tools](https://www.gnu.org/software/libc/manual/html_node/TZ-Variable.html), which you're almost certainly using under the hood if you're writing software on Linux or OSX.

```
$ TZ=UTC date
Wed 10 Feb 2021 12:00:00 AM UTC
```

Alright, this looks good. Let's try to see what time it is in New York:

```
$ TZ=America/New_York date
Tue 09 Feb 2021 07:00:00 PM EST
```

Makes sense, New York is 5 hours behind UTC. It outputs the time as `EST`, so presumably we can use that as a `TZ` variable:

```
$ TZ=EST date
Tue 09 Feb 2021 07:00:00 PM EST
```

Which looks like it works! But that's actually an illusion — say we tried doing this in July, instead of February:

```
$ TZ=America/New_York date
Fri 09 Jul 2021 08:00:00 PM EDT
```

Now we're in EDT, since it's daylight saving time. Makes sense, let's just plug that into `TZ` and see what happens:

```
$ TZ=EDT date
Sat 10 Jul 2021 12:00:00 AM EDT
```

And hang on, `America/New_York` means `EDT`, but `EDT` gives us the time in `UTC`! What's going on here?

Well, it turns out that `EDT` isn't a valid timezone, and `date` silently ignores the incorrect timezone variable:

```
$ TZ=LOL_THIS_DOESNT_EXIST date
Sat 10 Jul 2021 12:00:00 AM LOL
```

`date` "helpfully" ignores that the timezone is invalid, and outputs the date in UTC, but *using the text of the invalid timezone*.  Which is horrifying, but wait, why isn't EDT a valid timezone? I'm not sure what the actual reason is, but one reason that it's not correct in the general case to use the short timezone codes is that they aren't actually unique:

```
$ TZ=America/Chicago date
Tue 09 Feb 2021 06:00:00 PM CST
$ TZ=Asia/Taipei date
Wed 10 Feb 2021 08:00:00 AM CST
```

There are actually two timezones that are canonically named "CST", and they're 14 hours apart! The format that `date` outputs things in causes there to be two distinct moments in time that correspond to any date outputted in the `Asia/Taipei` or `America/Chicago` timezones, and there's no way to tell which is which by looking at it — what fun!

There is no good reason to use short timezone codes like EST, CST, PST — doing so will only bring you pain. Either use the tzdb name like `America/New_York`, or use an offset from UTC, depending on what you want.
