---
layout: post
title: "getElementById vs querySelector"
description: ""
date: 2021-10-29 19:30:00
---

A while ago, I was curious how the speed of `document.getElementById` compared to `document.querySelector` in Javascript. `querySelector` has to do a lot more work, so one would expect that it would be slower, but I didn't know if the difference was enough to care about.

I wrote a little benchmark to test this. You can run it by clicking <button onclick="run_test()" id="run_button">here</button>. This creates 100,000 elements, and then selects them all in a loop. It does this 105 times, and ignores the first 5 results (to avoid caching effects). It then plots a historgram of the average time per function call (in milliseconds) for each run. There is a template string used in the loop that I'm testing, so the exact numbers are slightly inflated, but in a way that is consistent across both functions.

On Firefox 92 on my Linux machine, `getElementById` gets a average of 7ms, while `querySelector` gets 62ms. Chromium 93 on the same machine does significantly worse, getting around 44ms and 206ms respectively. `querySelector` has significantly more variance in both cases, although it's worse in Chromium than it is in Firefox.

Apologies for the janky histograms — the reason I didn't publish this months ago is that Plotly's histograms are essentially completely broken, so I just went and wrote my own thing.

<h2 style="visibility:hidden;" id="gebi_title"><code>document.getElementById</code></h2>
<div id="gebi_results" class="hist"></div>
<br>
<h2 style="visibility:hidden;" id="qs_title"><code>document.querySelector</code></h2>
<div id="qs_results" class="hist"></div>

<script>
let has_ran = false;

function gen_histogram(data, max_datum, element) {
	const start = 0;
	const num_buckets = 30;
	const bucket_width = max_datum / num_buckets;

	const buckets = {}

	for (let i in data) {
		let bucket = Math.floor((data[i] - start) / bucket_width);
		if (buckets.hasOwnProperty(bucket)) {
			buckets[bucket] += 1;
		} else {
			buckets[bucket] = 1;
		}
	}

	for (let i = start; i < num_buckets; i++) {
		let bar = document.createElement("div");
		if (buckets.hasOwnProperty(i)) {
			bar.style.height = `${buckets[i]*5}px`;
			bar.innerText = Math.round(start + i*bucket_width);
		} else {
			bar.style.height = 0;
		}
		bar.style.width = `${1/num_buckets*100}%`

		bar.style.color = "white";
		bar.style.backgroundColor = "black";
		bar.style.display = "inline-block";
		bar.style.textAlign = "center";
		bar.style.textShadow = "1px 1px black, -1px -1px black, 1px -1px black, -1px 1px black"; // jank
		element.appendChild(bar);
	}

}

const num_elems = 100000;
const num_tests = 105;
const ignore_first_tests = 5;

function test_queryselector() {
	let start_time = performance.now();
	for (let i = 0; i < num_elems; i++) { 
		let foo = document.querySelector(`#test${i}`);
	}
	let end_time = performance.now();
	return (end_time - start_time);
}

function test_getelementbyid() {
	let start_time = performance.now();
	for (let i = 0; i < num_elems; i++) { 
		let foo = document.getElementById(`test${i}`);
	}
	let end_time = performance.now();
	return (end_time - start_time);
}

function run_test() {
	if (has_ran) {
		return;
	}
	document.getElementById("run_button").disabled = true;
	has_ran = true;
	for (let i = 0; i < num_elems; i++) { 
		let e = document.createElement("div");
		e.id = `test${i}`;
		document.body.appendChild(e);
	}

	let gebi_results = [];
	let qs_results = [];
	for (let i = 0; i < num_tests; i++) { 
		if (i % 2 === 0) {
			let results = test_getelementbyid();
			if (i + 1 > ignore_first_tests * 2) {
				gebi_results.push(results);
			}
		} else {
			let results = test_queryselector();
			if (i + 1 > ignore_first_tests * 2) {
				qs_results.push(results);
			}
		}
	}

	let max_datum = Math.max(...[...gebi_results, ...qs_results]);

	const avg = (array) => array.reduce((a, b) => a + b) / array.length;

	document.getElementById("gebi_title").style.visibility = "visible";
	document.getElementById("gebi_title").innerHTML = `<code>document.getElementById</code> (${Math.round(avg(gebi_results))}ms avg)`;

	document.getElementById("qs_title").style.visibility = "visible";
	document.getElementById("qs_title").innerHTML = `<code>document.querySelector</code> (${Math.round(avg(qs_results))}ms avg)`;

	var h2s = document.getElementsByTagName("h2");
	for(var i = 0; i < h2s.length; i++){
		h2s[i].style.visibility = "visible";
	}

	gen_histogram(gebi_results, max_datum, document.getElementById("gebi_results"));
	gen_histogram(qs_results, max_datum, document.getElementById("qs_results"));
}
</script>
