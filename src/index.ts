import { AnyAction } from "redux";

type ActionCreatorFn = (...args: never[]) => AnyAction & { type: string };

type MatchableAction<ActionCreator extends ActionCreatorFn> = ActionCreator & {
  matches(action: AnyAction): action is ReturnType<ActionCreator>;
};

export type SecondaryReducer<State, ActionCreator extends ActionCreatorFn> = (
  state: State,
  action: ReturnType<ActionCreator>
) => State;

export const withPrefix = (prefix: string) => (actionType: string) =>
  `${prefix}${actionType}`;

export const maction = <ActionCreator extends ActionCreatorFn>(
  actionCreator: ActionCreator
): MatchableAction<ActionCreator> =>
  Object.assign(actionCreator, {
    matches: (action: AnyAction): action is ReturnType<ActionCreator> =>
      action.type === actionCreator().type,
  });

const reduceSlice =
  <State>() =>
  <ActionCreator extends ActionCreatorFn>(
    actionCreator: ActionCreator,
    reduce: (state: State, action: ReturnType<ActionCreator>) => State
  ): SecondaryReducer<State, ActionCreator> =>
    reduce;

export const matchedReducerFactory = <State>() => ({
  reduceForAction: reduceSlice<State>(),
});
