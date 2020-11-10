---
layout: post
title: "Reviving Yo: How to Patch an APK"
description: ""
---

I got talking to a friend the other day about [Yo](https://en.wikipedia.org/wiki/Yo_(app)), the app where you can send your friends the word "Yo." It's nominally still around, run off donations, but the SSL certificate for the API server has been expired for a little while, so the app doesn't work anymore. Not to worry, though, that's something we can fix by patching the APK pretty quickly.

First, [download Yo on the Play Store](https://play.google.com/store/apps/details?id=com.justyo). Then, download [APK Extractor](https://play.google.com/store/apps/details?id=com.ext.ui), and use it to download the APK off your phone (you'll need to get it onto your computer somehow, I emailed it to myself). You should have a file called `Yo_base.apk`.

Next, install [`apktool`](https://ibotpeaches.github.io/Apktool/), and use it to decompile the APK:

```
apktool if Yo_base.apk
apktool d Yo_base.apk
```

This should make a directory called `Yo_base`, which you can edit however you want. I changed `https://newapi.justyo.co` to `http://newapi.justyo.co` in `res/values/strings.xml`, but you could also make other changes as well. Once you've done that, recompile the APK like so:

```
apktool b Yo_base
```

Now there should be a `Yo_base/dist/Yo_base.apk` file, but it's not signed, so we can't use it. Signing it isn't too tricky though. Using the `keytool` and `jarsigner` tools that come with the JDK:

```
keytool -genkey -v -keystore my-release-key.keystore -alias alias_name -keyalg RSA -keysize 2048 -validity 10000
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore my-release-key.keystore Yo_base/dist/Yo_base.apk alias_name
```

It'll ask you to make a password and enter your name and things, I don't think it really matters what you choose. Once you've done all that, you can move the `Yo_base/dist/Yo_base.apk` file to your phone, click through all the fuss that Android makes about running a unsigned APK, and start Yoing away! This also works for other apps just as well :)
