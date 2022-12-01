let fragCount = 0;

export function frag<T>(
  strings: TemplateStringsArray,
  ...values: any[]
): Frag<T> {
  return {
    count: ++fragCount,
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
  embedding: string;
  standalone?: string;
  count: number;
};

export function include<T>(frag: Frag<T>) {
  return frag.embedding;
}

// can only frag on fields
export function useFrag<T>(fragment: Frag<T>, data: T) {
  // if there's a select we can hoist it separately?
  // and bind to it separately?
  // 1. run the query
  // 2. subscribe to it
  // 3. pull semantics from it
}
