# Maction

A set of utility functions aimed to help you create well typed actions in React for `redux`. This also helps to remove
boilerplate code and keep your store and actions typed without having to completely restructure.

Inspiration for this comes from [this blog post](https://phryneas.de/redux-typescript-no-discriminating-union) written
by Lenz Weber, an author of [redux-toolkit](https://github.com/reduxjs/redux-toolkit).

## Usage

### `createMaction`

Creates a matchable action creator.

```ts
import {createMaction} from "maction";

const increment = createMaction((value: number) => ({
    type: "INCREMENT",
    value
}))
```

That is it! 🎉

You don't need to define an `interface` or `type` for the action - or create an `enum` to record the action types. Instead, the action creator itself can
be
used to match the action in the reducer. It is important that the action type is unique as you'd expect (a function
called `createPrefix` is provided to help with that).

```ts
// Component
dispatch(increment(10));

// Reducer
const reducer = (state: State, action: AnyAction): State => {
    // Use the action creator to match the action
    if (increment.matches(action)) {
        // This is now strongly typed
        return {...state, value: action.value}
    }

    return state;
}
```

### `createPrefix`

A simple utility function to create namespaced action types.

```ts
import {createMaction, createPrefix} from "maction";

const withPrefix = createPrefix("COUNTER_");

const increment = createMaction((value: number) => ({
    type: withPrefix("INCREMENT"),
    value
}))

increment(10).type === "COUNTER_INCREMENT"
```

### `matchableReducerFactory`

An optional utility function that can help keep your split off reducers typed in line with actions.

It returns a function that takes a matchable action as its first parameter, and a reducer function as the second. If a
generic for state has been provided, you should get full type safety here. This means if you change your action creator
you'll get TS warnings here without having to go digging too far!

`State` type should be provided as a generic argument to the factory.

```ts
import {matchableReducerFactory} from "maction";

const reduceForAction = matchableReducerFactory<State>();

// Here `increment` was created using `createMaction`
// The types for `state` and `action` will be correctly typed here
const incrementReducer = reduceForAction(increment, (state, action) => ({
    ...state,
    value: action.value
}))

const reducer = (state: State, action: AnyAction): State => {
    if (increment.matches(action)) {
        return incrementReducer(state, action);
    }
}
```

## Comparing boilerplate

Let's look at how this can replace your existing actions. This format may be familiar:

```ts
// actions.ts
export enum ActionType {
    INCREMENT = "INCREMENT",
    DECREMENT = "DECREMENT",
    RESET = "RESET"
}

type IncrementAction = {
    type: ActionType.INCREMENT,
    value: number
}

export const incrementAction = (value: number): IncrementAction => ({
    type: ActionType.INCREMENT,
    value
})

type DecrementAction = {
    type: ActionType.DECREMENT,
    value: number
}

export const decrementAction = (value: number): DecrementAction => ({
    type: ActionType.DECREMENT,
    value
})

type ResetAction = {
    type: ActionType.RESET
}

const resetAction = (): ResetAction => ({
    type: ActionType.RESET
})

export type Action = IncrementAction | DecrementAction | ResetAction;

// reducer.ts
const incrementReducer = (state: State, action: IncrementAction): State => ({
    ...state,
    value: state.value + action.value
})

const decrementReducer = (state: State, action: DecrementAction): State => ({
    ...state,
    value: state.value - action.value
})

const reducer = (state: State, action: Action): State => {
    switch (action.type) {
        case ActionType.INCREMENT:
            return incrementReducer(state, action);
        case ActionType.DECREMENT:
        case ActionType.RESET:
            return {
                ...state,
                value: 0
            }
        default:
            return state;
    }
} 
```

I've used this pattern many times - it feels safe and familiar. There is a lot of boilerplate code (looking at
you, `actions.ts`!) but it comes with type safety, and you deal with each action specifically. As pointed out in
the [blog post](https://phryneas.de/redux-typescript-no-discriminating-union) mentioned earlier, this isn't really a
great approach as we've typed `action` as `Action` in our reducer despite the fact that anything could be sent as an
action, not just actions from the union type we defined.

Now the same code using `maction`:

```ts
// actions.ts
import {createMaction} from "maction";

export const incrementAction = createMaction((value: number) => ({
    type: "INCREMENT",
    value
}))

export const decrementAction = createMaction((value: number) => ({
    type: "DECREMENT",
    value
}))

export const resetAction = createMaction(() => ({
    type: "RESET"
}));

// reducer.ts
import {matchableReducerFactory} from "maction";
import {AnyAction} from "redux";

const reduceForAction = matchableReducerFactory<State>();

const incrementReducer = reduceForAction(incrementAction, (state, action) => ({
    ...state,
    value: state.value + action.value
}))

const decrementReducer = reduceForAction(decrementAction, (state, action) => ({
    ...state,
    value: state.value - action.value
}))

const reducer = (state: State, action: AnyAction): State => {
    if (incrementAction.matches(action)) {
        return incrementReducer(state, action);
    }
    if (decrementAction.matches(action)) {
        return decrementReducer(state, action);
    }
    if (resetAction.matches(action)) {
        return {
            ...state, value: 0
        }
    }

    return state;
} 
```

Overall I think this pattern is much neater. You avoid a tonne of boilerplate, and it's much easier to add and remove
actions.
