import { AnyAction } from "redux";

type ActionCreatorFn = (...args: never[]) => AnyAction & { type: string };

type MatchableAction<ActionCreator extends ActionCreatorFn> = ActionCreator & {
  matches(action: AnyAction): action is ReturnType<ActionCreator>;
};

export type SecondaryReducer<State, ActionCreator extends ActionCreatorFn> = (
  state: State,
  action: ReturnType<ActionCreator>
) => State;

/**
 * Create namespaced actions by initialising `withPrefix("NAMESPACE")` somewhere with your actions.
 *
 * @param prefix
 *
 * @example
 * const withPrefix = createPrefix("COUNTER_");
 *
 * // action.type === "COUNTER_INCREMENT
 * const action = {
 *     type: withPrefix("INCREMENT")
 * }
 */
export const createPrefix = (prefix: string) => (actionType: string) =>
  `${prefix}${actionType}`;

/**
 * Creates a matchable action creator.
 *
 * A matchable action creator has a function called `matches` which can be used in your reducer to
 * match a specific action.
 *
 * @param actionCreator a function that returns an action. Can take any amount of params.
 *
 * @example
 * const increment = createMaction((amount: number) => ({
 *     type: "INCREMENT",
 *     amount,
 * })
 *
 * // In reducer
 * if (increment.matches(action)) {
 *     // This will be typed as `number`
 *     const { amount } = action;
 * }
 */
export const createMaction = <ActionCreator extends ActionCreatorFn>(
  actionCreator: ActionCreator
): MatchableAction<ActionCreator> =>
  Object.assign(actionCreator, {
    matches: (action: AnyAction): action is ReturnType<ActionCreator> =>
      action.type === actionCreator().type,
  });

const reduceForActionBuilder =
  <State>() =>
  <ActionCreator extends ActionCreatorFn>(
    actionCreator: ActionCreator,
    reduce: (state: State, action: ReturnType<ActionCreator>) => State
  ): SecondaryReducer<State, ActionCreator> =>
    reduce;

/**
 * Initialises action reducers with state type.
 *
 * State type should be provided as a generic argument.
 *
 * @returns {<State>(maction: MatchableAction, (state: State, action: MatchableAction) => State) => SecondaryReducer}
 *
 * @example
 * const reduceForAction = matchedReducerFactory<StateType>();
 *
 * // The param `increment` must have been created with `createMaction`
 * const incrementReducer = reduceForAction(increment, (state, action) => ({
 *     ...state,
 *     count: state.count + action.value
 * });
 */
export const matchableReducerFactory = <State = void>() =>
  reduceForActionBuilder<State>();
