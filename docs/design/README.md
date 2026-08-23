# Design records

One document per significant change, written before the work and kept
afterwards. They record what was decided and why, which the shipped code does
not explain on its own.

Each should state its context, the decision, and the consequences that
follow — including the ones accepted rather than avoided. The decision is the
part that stays memorable; the consequences are what a later reader needs and
what the author has usually forgotten.

`plans/` holds the implementation plans that followed them. Those are
historical: they describe how a change was built at the time, and the shipped
code is authoritative wherever the two differ.

The plans quote commit commands that end with a `Co-Authored-By:` trailer
naming a model. That was the convention when they were written and is no
longer: AI authorship is disclosed once in the README rather than per commit,
and a commit-msg hook now rejects the trailer. The quoted commands are left
as written because they record what happened. Do not copy them.

Neither is current intent. For that, read [the protocol](../protocol.md) and
[the playbook](../playbook.md).
