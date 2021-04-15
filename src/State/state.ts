import * as _ from 'lodash';

export type WorkFunction<T> = (innerState: T) => T;
export type TransitionFunction<T, K> = (state: T) => State<K>;
export type Transition<T, K> = {
    transitionFunction: TransitionFunction<T, K>;
    transitionCondition: (state: T) => boolean;
};
export type FinishType = 'Accept' | 'Reject' | undefined;

async function delay(ms: number): Promise<NodeJS.Timeout> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Class that represents one state in the machine
 */
class State<InnerStateType> {
    protected innerState: InnerStateType;
    private stateWork: WorkFunction<InnerStateType>;
    private workDelay: number;
    private transitions: Array<Transition<InnerStateType, any>> = [];
    protected initialTask: WorkFunction<InnerStateType>;
    private finalTask: WorkFunction<InnerStateType>;

    /**
     * Creates new state type parametrized by type of information it holds
     * @param initialInnerState Informations inside the state
     * @param stateWork Function that takes inner state, does something and returns new inner state that will override old one. It will be executed at least once before next transition.
     * @param workDelay In milliseconds, additional delay between the calls to work function. Must be positive. 0 by default.
     * @param initialTask One time task executed before work is started. Takes inner state and can update it by overriding with returned value. Do nothing by default.
     * @param finalTask One time task executed before state is changed . Takes inner state and can update it by overriding with returned value. Do nothing by default.
     */
    constructor(
        initialInnerState: InnerStateType,
        stateWork: WorkFunction<InnerStateType>,
        workDelay: number = 0,
        initialTask: WorkFunction<InnerStateType> = (state) => state,
        finalTask: WorkFunction<InnerStateType> = (state) => state
    ) {
        this.innerState = initialInnerState;
        this.stateWork = stateWork;
        this.initialTask = initialTask;
        this.finalTask = finalTask;
        if (workDelay >= 0) this.workDelay = Math.floor(workDelay);
        else throw new TypeError("workDelay should be positive integer");
    }

    /**
     * Adds new possible transition. If multiple transition can bo choosen - the preferred choice is undefined.
     * @param newTransition Object with condition to start transition and function that will take inner state and produce new state basing on the old one.
     */
    addTransition<K>(newTransition: Transition<InnerStateType, K>): void {
        this.transitions.push(newTransition);
    }

    /**
     * Replaces inner state. Can be used to reset or reuse state machine by providing new initial input.
     * @param newInnerState New inner state of the state
     */
    resetState(newInnerState: InnerStateType): void {
        this.innerState = newInnerState;
    }

    /**
     * Starts work of a function.
     */
    async startWork(): Promise<State<any>> {
        return new Promise<State<any>>(async (resolve) => {
            this.innerState = this.initialTask(this.innerState);
            let transitionFunction: TransitionFunction<InnerStateType, any> | undefined = undefined;

            while (transitionFunction === undefined) {
                this.innerState = this.stateWork(this.innerState);

                let possibleTransitions = this.transitions.filter(transition => transition.transitionCondition(this.innerState));
                transitionFunction = _.sample(possibleTransitions)?.transitionFunction;

                if (transitionFunction === undefined) await delay(this.workDelay);
            }

            this.innerState = this.finalTask(this.innerState);

            const newState = (transitionFunction as TransitionFunction<InnerStateType, any>)(
                this.innerState
            );

            resolve(newState);
        }).then((newState: State<any>) => newState.startWork());
    }

    /**
     * Returns if state is accepting, rejecting or undefined
     */
    finishType(): FinishType {
        return undefined;
    }

    /**
     * Gets inner state
     */
    getInnerState(): InnerStateType {
        return this.innerState;
    }
}

/**
 * Represents final state of computation
 */
abstract class FinalState<finalStateType> extends State<finalStateType> {
    constructor(finalInnerState: finalStateType, initialTask: WorkFunction<finalStateType>) {
        super(
            finalInnerState,
            (undefined) => undefined,
            0,
            initialTask,
            (undefined) => undefined
        );
    }

    /**
     * This function should not be used in FinalState.
     */
    addTransition<K>(): void {
    }

    /**
     * Starts work of a function.
     */
    async startWork(): Promise<State<any>> {
        this.innerState = this.initialTask(this.innerState);
        return this;
    }
}

/**
 * Represents accepting state that contains some information
 */
class AcceptingState<finalStateType> extends FinalState<finalStateType> {
    constructor(finalInnerState: finalStateType, initialTask: WorkFunction<finalStateType>) {
        super(finalInnerState, initialTask);
    }

    finishType(): FinishType {
        return 'Accept';
    }
}

/**
 * Represents rejecting state that contains some information
 */
class RejectingState<finalStateType> extends FinalState<finalStateType> {
    constructor(finalInnerState: finalStateType, initialTask: WorkFunction<finalStateType>) {
        super(finalInnerState, initialTask);
    }

    finishType(): FinishType {
        return 'Reject';
    }
}

export { State, AcceptingState, RejectingState };