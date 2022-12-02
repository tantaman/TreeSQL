```js
let fragCount = 0;

const fragRefs = new Map();

export function frag<T>(
  strings: TemplateStringsArray,
  ...values: any[]
): Frag<T> {
  return {
    id: ++fragCount,
    // TODO: should shadow fields
    // or should de-dupe fields in the final composed query
    embedding: String.raw({ raw: strings }, ...values),
    // ^- field only frags have no standalone?
    // the _simplest_ first pass would be to
    // not do any splitting and literally
    // re-run the whole composed query then _diff_
    // by frag.
    // - data comes in
    // - we mutate frag refs on props (yes, mutate a prop)
    // - useFrag listens to those refs
    // - useFrag diffs
    // - if different, set state
    //
    // can we rm react then? since react
    // will dom diff too
    // but if we data diff, why dom diff?
    // we are pretty sure what'll be touched.
    //
    // put db in worker for this approach?
  };
}

export type Frag<T> = {
  id: number,
  embedding: string,
  standalone?: string,
};

export type FragRef<T> = {};

export function include<T>(frag: Frag<T>) {
  return frag.embedding;
}

// can only frag on fields
export function useFrag<T>(data: T) {
  // if there's a select we can hoist it separately?
  // and bind to it separately?
  // 1. run the query
  // 2. subscribe to it
  // 3. pull semantics from it
  // looks up frag from fragRefs
  // subscribes to it for state updates
}

export function useQuery() {
  // goes thru query
  // query is not yet compiled
  // need to know the path to each
  // fragment
  //
  // so when we traverse the json tree we know what frag to go to..
  // or we re-key things
}

/*
Algo:
- Update received
- Start diffing JSON at useQuery / root level
- Once we hit a difference, look up the frag ref
- Push that 

Or...

Remove all frags.
Flatten the response based on fragid.

Diff each fragid separately

Update components that use those fragids.

What if someone uses a frag inside an array of values?

Todos.map(t => <Todo />)

SELECT {id, content: (SELECT {} FROM todo)} FROM todos;

if content is a frag...
that frag has many values.

We'd need to diff against each value for each instance
of the component using the frag.

Arrays and keys :|

Decomposing the selects is one option and subscribe at the
point or whatever level.

Require users to just use useQuery...
*/
```
