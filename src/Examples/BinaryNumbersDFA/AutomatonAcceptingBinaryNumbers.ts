/**
* Simple automaton that starts with binary numer and finishes in Accepting state if number is a valid binary number or Rejecting if it is not.
**/

import { State, AcceptingState, RejectingState } from '../../State/state';

function eatLetter(string: string): string {
    return string.substring(1);
}

function firstLetterEqual(string: string, chars: Array<string>) {
    if(String.length === 0)
        return false;
    return chars.some(char => char[0] === string[0]);
}

const q0 = new State<string>("", innerState => innerState, 0, innerState => {
    console.log(`Actual state q0: ${innerState}`);
    return innerState;
}, innerState => eatLetter(innerState));

const q1 = new State<string>("", innerState => innerState, 0, innerState => {
    console.log(`Actual state q1: ${innerState}`);
    return innerState;
}, innerState => eatLetter(innerState));

const q2 = new State<string>("", innerState => innerState, 0, innerState => {
    console.log(`Actual state q2: ${innerState}`);
    return innerState;
}, innerState => eatLetter(innerState));

const q3 = new State<string>("", innerState => innerState, 0, innerState => {
    console.log(`Actual state q3: ${innerState}`);
    return innerState;
}, innerState => eatLetter(innerState));

const accepting = new AcceptingState<string>("", innerState => {
    console.log(`Actual state acc: ${innerState}`);
    return innerState;
});

const rejecting = new RejectingState<string>("", innerState => {
    console.log(`Actual state rej: ${innerState}`);
    return innerState;
});

q0.addTransition<string>({
    transitionCondition: (innerState) => {
        return innerState.length === 0;
    },
    transitionFunction: (innerState) => {
        rejecting.resetState(innerState);
        return rejecting;
    }
});

q0.addTransition<string>({
    transitionCondition: (innerState) => {
        return firstLetterEqual(innerState, ['0']);
    },
    transitionFunction: (innerState) => {
        q1.resetState(innerState);
        return q1;
    }
});

q0.addTransition<string>({
    transitionCondition: (innerState) => {
        return firstLetterEqual(innerState, ['1']);
    },
    transitionFunction: (innerState) => {
        q3.resetState(innerState);
        return q3;
    }
});

q1.addTransition<string>({
    transitionCondition: (innerState) => {
        return firstLetterEqual(innerState, ['0', '1']);
    },
    transitionFunction: (innerState) => {
        q2.resetState(innerState);
        return q2;
    }
});

q1.addTransition<string>({
    transitionCondition: (innerState) => {
        return innerState.length === 0;
    },
    transitionFunction: (innerState) => {
        accepting.resetState(innerState);
        return accepting;
    }
});

q2.addTransition<string>({
    transitionCondition: (innerState) => {
        return firstLetterEqual(innerState, ['0', '1']);
    },
    transitionFunction: (innerState) => {
        q2.resetState(innerState);
        return q2;
    }
});

q2.addTransition<string>({
    transitionCondition: (innerState) => {
        return innerState.length === 0;
    },
    transitionFunction: (innerState) => {
        rejecting.resetState(innerState);
        return rejecting;
    }
});

q3.addTransition<string>({
    transitionCondition: (innerState) => {
        return firstLetterEqual(innerState, ['0', '1']);
    },
    transitionFunction: (innerState) => {
        q3.resetState(innerState);
        return q3;
    }
});

q3.addTransition<string>({
    transitionCondition: (innerState) => {
        return innerState.length === 0;
    },
    transitionFunction: (innerState) => {
        accepting.resetState(innerState);
        return accepting;
    }
});

(async () => {
    try {
        let finalState: State<string> | undefined = undefined;

        q0.resetState("0001");
        finalState = await q0.startWork();
        console.log(finalState.finishType());
        console.log("------");

        q0.resetState("0");
        finalState = await q0.startWork();
        console.log(finalState.finishType());
        console.log("------");

        q0.resetState("10010101101");
        finalState = await q0.startWork();
        console.log(finalState.finishType());
        console.log("------");

        q0.resetState("0000000");
        finalState = await q0.startWork();
        console.log(finalState.finishType());

    } catch(e) {
        console.log("Unknown error");
    }
})();