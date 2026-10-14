---
pageClass: flow-page
---

# recursive_lean_prover

Prove a theorem in Lean by splitting it up. Each lemma gets one plan from
[`humanize1:gen-plan`](/flows/humanize1#gen-plan), a proof in prose revised until a reviewer
finds no invalid step, a split into child lemmas where it needs one, and a formal proof built
by [`humanize1:rlcr`](/flows/humanize1#rlcr) in a git worktree of its own. A lemma is accepted
when your comparator passes and a fresh reviewer reruns it; it is then written to a Markdown
wiki, and lemmas waiting on it can start.

<FlowFacts flow="recursive_lean_prover" />

<Badge type="warning" text="worker: claude · codex · kimi" />
<Badge type="info" text="meant for codex in both roles" />

<FlowPlayer flow="recursive_lean_prover" />

See also: [humanize1](/flows/humanize1), the phases it is built from.
