---
layout: post
title: "Linux Kernel: Learning about the OOM killer"
description: Diving into Linux's Out-Of-Memory killer
tags: [linux, kernel]
---
One of the things that I'm interested in, but don't really understand at this point, is the Linux kernel's out-of-memory killer. In this post, I'll try to fix that!

The out of memory killer is a part of the Linux kernel is used when the system is almost completely out of memory (RAM), and needs to free some up. It does this by killing programs, thus reclaiming the memory that they were using. Having spent a lot of time working on a machine with 512MB of RAM, I'm pretty familiar with the OOM killer getting activated, but I don't really understand _how_ it works. In this post, I'm going to go through the source code for the OOM killer to try to figure out how it works!

First, we need to actually get the source for the linux kernel. This is located at [git.kernel.org](https://git.kernel.org/cgit/). Specifically, we want [kernel/git/torvalds/linux.git](https://git.kernel.org/cgit/linux/kernel/git/torvalds/linux.git/). The file that contains the OOM killer code is [`mm/oom_kill.c`](https://git.kernel.org/cgit/linux/kernel/git/torvalds/linux.git/tree/mm/oom_kill.c). I think that `mm` stands for "memory management". While I'm writing this, the git commit that I'm looking at is `ba6d973f78`. Since the file is more than 1000 lines long, we'll just look at a few functions:

I see from scrolling through it that [`oom_badness`](https://git.kernel.org/cgit/linux/kernel/git/torvalds/linux.git/tree/mm/oom_kill.c?id=ba6d973f78eb62ffebb32f6ef3334fc9a3b33d22#n160) looks interesting - according to the comment this determines what process to kill!

Let's look at the function signature:

{% highlight c %}
unsigned long oom_badness(struct task_struct *p, struct mem_cgroup *memcg,
			  const nodemask_t *nodemask, unsigned long totalpages)
{% endhighlight %}

Here's what I get from this:

* The score that it returns is a unsigned long - I wonder what it's max value is, or if it even has a maximum.
* It takes four arguments:
  1. A `task_struct` called `p`, presumably standing for "process". `task_struct` is defined in [`includes/linux/sched.h:1501`](https://git.kernel.org/cgit/linux/kernel/git/torvalds/linux.git/tree/include/linux/sched.h?id=ba6d973f78eb62ffebb32f6ef3334fc9a3b33d22#n1501). This contains a ton of stuff! But the important part is that it represents a process.
  2. A `mem_cgroup` variable. [CGroups](https://en.wikipedia.org/wiki/Cgroups) in Linux are a way to sandbox different resources - in the case of a memory cgroup, you could limit a specific process or set of processes to, say, only taking up 512MB of RAM. Presumably the memory cgroup that the process is is is taken into account somewhere.
  3. nodemask: I'm not quite sure what this is.
  4. totalpages: This is the total amount of RAM that the system has.

Next we, create a couple of variables:

{% highlight c %}
{
	long points;
	long adj;
{% endhighlight %}

`points` keeps track of the number of 'badness points' that this task has - this value is what we will end up returning

`adj` is more complicated - but it seems like it has to do with the `oom_score_adj` value. I know that this value exists in `/proc/<PID>/oom_score_adj`, so let's look at `man procfs` to figure this out!

```
/proc/[pid]/oom_score_adj (since Linux 2.6.36)
This file can be used to adjust the  badness  heuristic  used  to  select  which
process gets killed in out-of-memory conditions.

The  badness  heuristic  assigns  a  value to each candidate task ranging from 0
(never kill) to 1000 (always kill) to determine which process is targeted.   The
units  are  roughly  a proportion along that range of allowed memory the process
may allocate from, based on an estimation of its current memory  and  swap  use.
For  example,  if  a task is using all allowed memory, its badness score will be
1000.  If it is using half of its allowed memory, its score will be 500.

...

The value of oom_score_adj is added to the badness score before it  is  used  to
determine   which   task   to   kill.    Acceptable   values  range  from  -1000
(OOM_SCORE_ADJ_MIN) to +1000 (OOM_SCORE_ADJ_MAX).  This  allows  user  space  to
control the preference for OOM-killing, ranging from always preferring a certain
task or completely disabling it from OOM killing.  The  lowest  possible  value,
-1000,  is  equivalent to disabling OOM-killing entirely for that task, since it
will always report a badness score of 0.

Consequently, it is very simple for user space to define the amount of memory to
consider  for each task.  Setting a oom_score_adj value of +500, for example, is
roughly equivalent to allowing the remainder of tasks sharing the  same  system,
cpuset,  mempolicy, or memory controller resources to use at least 50% more mem‐
ory.  A value of -500, on the other hand, would be roughly  equivalent  to  dis‐
counting  50%  of  the  task's  allowed  memory from being considered as scoring
against the task.
```

So presumably this value will contain something relating the adjustment value!

Let's continue:

{% highlight c %}
	if (oom_unkillable_task(p, memcg, nodemask))
		return 0;
{% endhighlight %}

Pretty simple - if it's unkillable, return zero (which makes sure that it won't be killed)

{% highlight c %}
	p = find_lock_task_mm(p);
{% endhighlight %}

`find_lock_task_mm` will make sure that the task p has a `->mm` member, returning `NULL` if it can find any subthread with a valid `->mm`.

Returning null causes us to mark the task not to be killed:

{% highlight c %}
	if (!p)
		return 0;
{% endhighlight %}

If we can find a subthread that has a valid `mm` member, we continue on:

{% highlight c %}
	/*
	 * Do not even consider tasks which are explicitly marked oom
	 * unkillable or have been already oom reaped or the are in
	 * the middle of vfork
	 */
{% endhighlight %}

A few things to note here:

* It's interesting that being "explicitly marked oom unkillable" Isn't checked in `oom_unkilable_task()`. I wonder why that is.
* I'm not quite sure the reason for not oom-killing tasks that are `vfork`ing. My guess would be that it's because the task that should actually be killed is the parent, but I'm not sure about that.

Let's go on:

{% highlight c %}
	adj = (long)p->signal->oom_score_adj;
{% endhighlight %}

And here we figure out exactly what `adj` represents! It is in fact the oom adjustment value that the man page talks about.

{% highlight c %}
	if (adj == OOM_SCORE_ADJ_MIN ||
			test_bit(MMF_OOM_SKIP, &p->mm->flags) ||
			in_vfork(p)) {
		task_unlock(p);
		return 0;
	}
{% endhighlight %}

This if statement implements what the comment says it does - pretty simple. I'm not sure why `task_unlock()` is called in this case - it doesn't seem to have to do with anything in this if statement, but there it is!

Moving on to the meat of the 'badness function', we have:

{% highlight c %}
	/*
	 * The baseline for the badness score is the proportion of RAM that each
	 * task's rss, pagetable and swap space use.
	 */
	points = get_mm_rss(p->mm) + get_mm_counter(p->mm, MM_SWAPENTS) +
		atomic_long_read(&p->mm->nr_ptes) + mm_nr_pmds(p->mm);
	task_unlock(p);
{% endhighlight %}

The line that sets `points` is pretty simple - the number of 'badness points' a process starts with is equal to the sum of three things:

1. It's RSS (Resident Set Size). This is a measure of memory that a process is using. This includes shared libraries, stack, and heap, but *not* swap.
2. It's pagetable use - The [page table](https://en.wikipedia.org/wiki/Page_table) is how Linux allows every program that is running to have it's own block of memory that appears to be continuous. Each page in the pagetable takes up some RAM, which is why we're taking it into account.
3. It's swap usage. Swap is hard drive space that is used like RAM once the system runs out of RAM. We add this because it isn't included in the RSS.

If you're reading closely, you'll notice that the comment states that we're summing three things, but the statement actually sums four! This is because the page table entries are separated into two things - PTE table pages and PMD table pages. The reason that this distinction exists is because different architectures handle memory management differently, and linux chooses to abstract it in this way. In any case, we need to add together both the PTE pages and the PMD pages to get the total number of pages.

Next, there's the `task_unlock()` line. This explains why there was a `task_unlock()` in the if statement above - it looks like the task must be unlocked in this function, so because the function returned in that if statement, it had to `task_unlock()` then. I'm still not sure why the task needs to be unlocked, but that's a question for another day!

Let's look at the next part of the code:

{% highlight c %}
	/*
	 * Root processes get 3% bonus, just like the __vm_enough_memory()
	 * implementation used by LSMs.
	 */
	if (has_capability_noaudit(p, CAP_SYS_ADMIN))
		points -= (points * 3) / 100;
{% endhighlight %}

The "LSMs" that they refer to are, I think, [Linux Security Modules](https://en.wikipedia.org/wiki/Linux_Security_Modules).

This code simply makes processes run by root slightly less likely to be oom-killed.

Moving on, we apply the adjustment from `oom_score_adj`:

{% highlight c %}
	/* Normalize to oom_score_adj units */
	adj *= totalpages / 1000;
	points += adj;

	/*
	 * Never return 0 for an eligible task regardless of the root bonus and
	 * oom_score_adj (oom_score_adj can't be OOM_SCORE_ADJ_MIN here).
	 */
	return points > 0 ? points : 1;
}
{% endhighlight %}

The most complicated part of this is the `adj *= totalpages / 1000`. I think that the reason for the `totalpages` in this is that the values that we assigned to `points` previously were measured in actual memory usage, while the value of `oom_score_adj` is a static ±1000. This equation converts the value in adj to something that takes into consideration the total amount of RAM available.

The checking in the return statement just makes sure that the return value is always 1 or greater. This is interesting, because on my system, there are quite a few processes that shouldbe eligible, but have a `oom_score` of 0 (You can find the oom score of a running process with `cat /proc/<PID>/oom_score`). My system may be running a different version of this function, but I'm not sure. A mystery for another day!

Anyway, that's it for now! I like this format for looking at parts of the kernel, since it gives me a lot of jumping off points and other questions to ask! Here's a few questions that I have now:

* What actually calls the oom killer code?
* What _exactly_ is the page table? How is it different on x86 vs ARM?
* How does LSM work? What hooks does it provide? How do those hooks work?
* How does PaX work?
* How does memory management work on a `RT_PREEMPT` system? Does anything about the oom killer change?
* How does RSS compare to other ways of measuring memory taken, like VSZ or USS?
* Why are there `goto`s in the kernel source? Is it just bad practice, or is it faster/better?
* How do spinlocks work? Does the kernel use any other types of locks?
* How does RCU work?
* What happens if pid 1 is the only process, but the oom killer gets called?

All interesting things to learn about!
