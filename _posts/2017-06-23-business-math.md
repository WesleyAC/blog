---
layout: post
title: "Business Math"
description: "The surprising art of setting prices for B2B software"
tags: [entrepreneurship]
---

Say you've made some software that will increase an employee's productivity by 1%. Your target market is medium sized businesses. What is a good price point for your software?

Let's say that your target company has 100 employees[^1], and each employee is paid $48,000[^2]. How much is your software worth to the company?

About $5600 per month.

How do you get to that figure?

First, find the actual amount paid by the company for each employee. In the case of an employee with a salary of $48,000, this is probably at least 1.4 times the salary[^3], so that gets us around $67,200. They have 100 employees, so if all of them use the software, it's worth $67,200 * 100 * 0.01 = $67,200 per year (the 0.01 is for the 1% boost in productivity caused by your software). This works out to $5,600 per month. Obviously you can't charge exactly $5,600 per month, since the company will want to get some benefit for using it, but pricing at around $1,000 per month would be entirely reasonable.

This kind of math also applies pretty well to other pricing schemes (like per seat per month).

Let's look at some prices that real companies charge, including the cost for our example company (100 employees all using the software, billed monthly):

* [Altium Designer](http://www.altium.com/) ~$4,000 per year per seat[^4] ($33,333 per month @ 100 seats)
* [Slack](https://slack.com/pricing) $6.67 - $12.50 per month per seat ($667 - $1250 per month @ 100 seats)
* [Oracle MYSQL Server](http://www.oracle.com/us/corporate/pricing/price-lists/mysql-pricelist-183985.pdf) $2,000 - $20,000 per year ($166 - $1,666 per month)
* [Red Hat Enterprise Linux Developer Support](https://www.redhat.com/en/store/red-hat-enterprise-linux-developer-support#?sku=RH2282403) $5,000 per year for 25 subscriptions ($1,666 per month @ 100 seats)
* [AutoCAD](https://www.autodesk.com/products/autocad/subscribe?plc=ACD&term=1-YEAR&support=ADVANCED&quantity=1) $1,470 per year per seat, more if bought monthly ($12,250 per month @ 100 seats)
* [Microsoft Office 360](https://products.office.com/en-us/business/compare-more-office-365-for-business-plans) $12 - $35 per seat per month ($1,200 - $3,500 per month @ 100 seats)

For all of these, the cost for the most advanced package/plan is far over $1,000/month for our example company. These numbers are just not a big deal at the scale of a company.

What implications does this have?

* An engineer who can make a product that increases productivity by 1% and sell it to a couple of companies can make more than enough money to live on.
* Most people will price their software far lower than it's worth. (The inspiration for this post is the comments on [this](https://news.ycombinator.com/item?id=14552140) HN post, which was pricing B2B software at $10 per month)
* It can be really hard to understand the scale of financial decisions that businesses make.
* Obviously there's a tradeoff between low price/many customers and high price/few customers. The best strategy is probably to start off as high price/few customers so that your company can be default alive with just a few sales, then transition to low price/many customers so that losing any single customer will have a lower impact on the business. This also has the advantage that you'll be seen as "nice" for reducing prices, but if you try to do the reverse, you could end up losing customers.
* When selling to a business, the person who is buying the product is not spending their own money. This is really powerful :)


[^1]: This is actually a "small business" by the [US government's standards](https://www.sba.gov/contracting/getting-started-contractor/make-sure-you-meet-sba-size-standards/table-small-business-size-standards), at least for all businesses that are defined as "small" based on number of employees.
[^2]: [Exactly the US average](https://www.ssa.gov/OACT/COLA/AWI.html)
[^3]: I'm basing this of the figures [here](http://web.mit.edu/e-club/hadzima/how-much-does-an-employee-cost.html), which show that taxes and benefits alone will get to 1.25-1.4x salary. When you include equipment, space, etc 1.4x seems like a reasonable lower bound.
[^4]: Altium's business model seems to be roughly: You can't be told how much a seat costs until you call us, and we get to shake you down and tell you how many of your children you need to sacrifice per seat per year. Also, we'll do everything we can to lock you into a support contract because fuck you. I'm basing my $4,000 figure off of what I've heard online, but really I have no idea.
