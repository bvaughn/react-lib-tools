// <begin>

import { Counter } from "sample-lib";

function CounterBasicExample() {
  return (
    <Counter
      initialValue={0}
      onChange={(value) => console.log("New value:", value)} // hidden
      max={10}
      min={0}
    />
  );
}

// <end>

export { CounterBasicExample };
