import { Button } from "react-lib-tools";

// <begin>

import { useRef } from "react";
import { Counter, type CounterImperativeHandle } from "sample-lib";

function CounterImperativeHandleExample() {
  const counterRef = useRef<CounterImperativeHandle>(null);

  return (
    <>
      <Counter counterRef={counterRef} initialValue={5} />
      <Button onClick={() => counterRef.current?.reset()}>Reset</Button>
    </>
  );
}

// <end>

export { CounterImperativeHandleExample };
