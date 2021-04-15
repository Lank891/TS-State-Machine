## TS State Machine
Very simple state machine in typescript alongside with example

------

In `src/Examples/BinaryNumbersDFA/AutomatonAcceptingBinaryNumbers.ts` there is an example that creates simple automaton that checks if provided string is a valid binary number:

![Automaton](img/AcceptingBinaryNumbersAutomaton.png)

### How to use?
1. Create states using `State<T>` class, where `T` is a type of data held by the state.
2. (optional) Create accepting and rejecting states using `AcceptingState<T>` and `RejectingState<T>` classes, where `T` is a type of data held by them.
3. Add transitions to states by calling `state.addTransition<K>` function, where `K` is a type of data held by next state
4. (optional) Restet data of initial state by calling `state.resetState` function
5. `let finalState = await state.startWork()` (mind infinite calculations though!)
6. Check what happend by calling `finishState.finishType()`
