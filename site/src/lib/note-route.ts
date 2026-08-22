export type Status = 'open' | 'working-answer' | 'parked';
export type Kind = 'positions' | 'questions';

// The one place the status→section rule lives. A note with a working answer
// is a position; anything else is still an open question. This rule was
// independently encoded in nine call sites — layouts, libraries, page
// routes and endpoints — which agreed only by coincidence, and which a
// tenth encoding (the redirect map) would have joined.
export const kindFor = (status: Status): Kind =>
  status === 'working-answer' ? 'positions' : 'questions';

// The section a note is *not* published under. A status change moves a note
// between the two, so this is where its stale URL points — and therefore
// where the redirect to its current home belongs.
export const otherKind = (status: Status): Kind =>
  kindFor(status) === 'positions' ? 'questions' : 'positions';
