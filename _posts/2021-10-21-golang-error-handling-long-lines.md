---
layout: post
title: "Go, Error Handling, and Big Text Files"
description: ""
---

I was recently trying to work with a dataset that was provided to me as a MySQL database dump. Since I'm not a masochist, I certainly wasn't going to run a MySQL database. Instead, I figured, I'd just write a quick little script to parse the database dump and write it out to a nicer format.

I planned to just grab some off-the-shelf SQL parser, write a tiny bit of hacky glue code, and be done — [sqlparser-rs](https://github.com/sqlparser-rs/sqlparser-rs/issues/362) was the first thing I reached for, but I quickly found that its support for MySQL was [not up to snuff](https://github.com/sqlparser-rs/sqlparser-rs/issues/362). Abandoning sqlparser-rs, I turned to [pingcap/parser](https://github.com/pingcap/parser/), which claimed to target the MySQL dialect. The only catch: I have to deal with writing Go. But it's just a tiny script, how bad can it be?

I started with a simple script to loop through all the lines in the file:

```go
package main

import (
	"bufio"
	"log"
	"fmt"
	"os"
)

func main() {
	file, err := os.Open(os.Args[1])

	if err != nil {
		log.Fatal(err)
	}

	scanner := bufio.NewScanner(file)
	scanner.Split(bufio.ScanLines)

	lines := 0

	for scanner.Scan() {
		lines++
	}

	fmt.Println(lines)

	file.Close()

}
```

Let's go ahead and run this with a test file:

```
$ go run main.go test.txt
2
```

It's got two lines. Except:

```
$ wc -l test.txt
4 ./test.txt
```

What's going on here? Well, it turns out that when a line is longer than `bufio.MaxScanTokenSize`, which defaults to 65536, the scanner will silently stop scanning. I guess you're supposed to know that:

```go
if err := scanner.Err(); err != nil {
   log.Fatal(err)
}
```

Is the invocation that you're supposed to use, but the compiler won't warn you, `go vet` won't warn you, [`staticcheck`](https://staticcheck.io) won't warn you. It seems like the Go philosophy is that you should simply read the docs for every function you call, think carefully about what kinds of errors can happen, and then write the code to handle them. If you forget, well, shoulda thought more carefully about it!

I was interested in giving Go another shot, after having some major compile-speed frustrations with Rust stemming from people being too clever with types, but I don't feel that I can take a language where it's this easy to fuck up error handling seriously.

Error handling can be subtle and nuanced in a lot of ways, but one of my baseline expectations for any modern language is that errors will not be silent: static, default-on tooling should be able to give you a list of every error you aren't handling, and ideally, just reading the source code should make unhandled errors legible without having to have knowledge of library code. I'm sad that Go seems to fail that benchmark.

---

<br>

Update: Someone asked me about the feasibility of writing a static check to catch this error. It seem to me that it should be quite easy, given the static analysis infrastructure that exists already for Go, but th problem is that this kind of API (which Go seems to have a lot of) doesn't express the error semantics in the types, but rather leaves it implicit in the structure of the library code — this means that a static check for this can't be generic, but instead has to specifically know about the error semantics of `bufio.Scanner`, which are only expressed in the docs. It's easy to make a static check for this exact thing, but it's essentially impossible to write a static check that will catch this entire category of error.
