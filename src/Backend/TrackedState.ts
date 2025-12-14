import LogicState, { UpdateType } from "./LogicState";
import { Observable, Subject, Subscription } from "rxjs";

/** Helper class that makes it easy to reference the state that should be displayed by the tracker */
export default class TrackedState {
  private static _state: LogicState = new LogicState();
  private static _updates: Subject<UpdateType> = new Subject<UpdateType>();
  private static _sub: Subscription | null = null;

  public static readonly updates = TrackedState._updates as Observable<UpdateType>;

  public static get state(): LogicState {
    return this._state;
  }

  public static set state(state: LogicState) {
    this._state = state;
    this._sub?.unsubscribe();
    this._sub = state.updates.subscribe(update => this._updates.next(update));
    this._updates.next(UpdateType.Any);
  }
}
