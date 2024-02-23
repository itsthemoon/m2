# M2: Actors and Remote Procedure Calls (RPC)
> Full name: `Jackson Davis`
> Email:  `<jackson_m_davis@brown.edu>`
> Username:  `jdavis70`

## Summary
> Summarize your implementation, including key challenges you encountered

My implementation comprises `5` software components, totaling `180` lines of code. Key challenges included `having problems with circular dependencies. To fix this I had to ensure that distribution.js and local.js were both not requiring each other. To solve for this I made use of the util.js file which gave me access to everything I needed`.

## Correctness & Performance Characterization
> Describe how you characterized the correctness and performance of your implementation

*Correctness*: I wrote `5` tests; these tests take `0.283 s` to execute. 

*Performance*: Evaluating RPC performance using [high-resolution timers](https://nodejs.org/api/perf_hooks.html) by sending 1000 service requests in a tght loop results in an average throughput of `626206.5621213397` requests per second and an average latency of `0.0015969171524047852` ms.

## Key Feature
> How would you explain your implementation of `createRPC` to your grandparents (assuming your grandparents are not computer scientists...), i.e., with the minimum jargon possible?

Imagine you have a magic notebook. Whenever you write a question in it, the notebook finds the answer and writes it back on the next page as soon as you flip it. This is similar to what createRPC.

To be more specific, let's say you have a friend who's really good at math, and you want to ask them math questions and get answers quickly. But your friend lives far away, so you can't ask them directly. Instead, you write your question in your magic notebook, and as soon as you flip the page, the answer from your friend appears.

## Time to Complete
> Roughly, how many hours did this milestone take you to complete?

Hours: `6`
