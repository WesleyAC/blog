---
layout: post
title: "End-to-end testing emails"
description: ""
---

I came up with a really slick trick to write E2E tests that deal with sending/receiving emails recently. This is the sort of thing that seems like it's probably usually sort of a nightmare — I wanted to write a test for registering a account on a website, where part of the flow was clicking on a validation link in a email.

The slick trick is a test SMTP server which is also a HTTP server. It's 39 lines of Javascript and extraordinarily simple:

```javascript
const SMTPServer = require("smtp-server").SMTPServer;
const http = require("http");

let emails = {};

new SMTPServer({
  authOptional: true,
  onData: (stream, session, callback) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('end', () => {
      const data = Buffer.concat(chunks).toString('utf8');
      console.log(data);
      const email = session.envelope.rcptTo[0].address;
      if (email in emails) {
        emails[email].push(data);
      } else {
        emails[email] = [data];
      }
      callback();
    });
  }
}).listen(2525);

http.createServer(async (req, res) => {
  const email = req.url.slice(1);
  if (!(email in emails)) {
    emails[email] = [];
  }

  res.writeHead(200, {"Content-Type": "text/plain"});

  const initial_num_emails = emails[email].length;
  while (emails[email].length == initial_num_emails) {
    await new Promise(resolve => setTimeout(resolve, 10));
  }

  res.end(emails[email][initial_num_emails]);
}).listen(2424);
```

This allows you to make a request to `http://localhost:2424/test@example.com`, which will block until the SMTP server on port 2525 receives a email to `test@example.com`, at which point it'll return the full text of the email.

This allows for writing a super simple E2E tests — here's my helper function to register a new user:

```javascript
async function registerAndLogin(page) {
  await page.goto('/register');
  const email = `${randomUUID()}@example.com`;
  const password = randomUUID();
  await page.getByPlaceholder('Email').fill(email);
  await page.getByPlaceholder('Password').fill(password);
  const verification_email = fetch(`http://localhost:2424/${email}`);
  await page.getByRole('button', { name: 'Sign Up' }).press('Enter');
  const verification_email_response = await verification_email;
  const verification_email_text = await verification_email_response.text();
  const verification_link = /(https?:\/\/[^\s]+)/gm.exec(verification_email_text)[1];
  await page.goto(verification_link);
  return {
    email: email,
    password: password
  };
}
```

Note the nice use of async/await to make the fetch request before pressing the "Sign Up" button.

As soon as I came up with this I immediately started showing it to everyone — my friend said "I feel like I just learned a new skateboard trick" — excellent praise, in my book.

As a sidenote, if you haven't used [Playwright](https://playwright.dev) for E2E tests, you're missing out. It's my opinion that the existence of Playwright moves E2E testing of webapps from being something that's usually tedious and flaky but sometimes worth the costs to something that's viable as a primary testing strategy.

Unit tests are best when code is decoupled and complex, but web code tends to be simple but tightly connected. This makes E2E testing a extremely useful strategy, and Playwright makes it simple to write non-flaky E2E tests with a small amount of effort — check out the [codegen tool](https://playwright.dev/docs/codegen) and the [trace viewer](https://playwright.dev/docs/trace-viewer) if you haven't.

If you want E2E tests to be your main tests, it does require some somewhat careful planning — since I [use SQLite](/posts/consider-sqlite/) and don't rely on any cloud tools, I can have tests that run extremely quickly (and even in parallel), without relying on any external resources, which is key for this kind of strategy. If you can swing it, though, it's pretty nice.
