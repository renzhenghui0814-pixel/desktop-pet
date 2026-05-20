/**
 * 猫咪状态机
 * 管理状态转换规则，触发姿势补间
 */

export const STATES = {
  WALKING: 'walking',
  IDLE: 'idle',
  SITTING: 'sitting',
  SLEEPING: 'sleeping',
  STRETCHING: 'stretching',
  GROOMING: 'grooming',
  MEOWING: 'meowing',
  LOOKING: 'looking',
  STANDING: 'standing',
};

// 状态转换规则：哪些状态可以转到哪些状态
const TRANSITIONS = {
  [STATES.WALKING]:    [STATES.IDLE, STATES.SITTING, STATES.SLEEPING, STATES.STRETCHING, STATES.GROOMING, STATES.MEOWING, STATES.LOOKING],
  [STATES.IDLE]:       [STATES.WALKING, STATES.SITTING, STATES.SLEEPING, STATES.STRETCHING, STATES.GROOMING, STATES.LOOKING],
  [STATES.SITTING]:    [STATES.WALKING, STATES.IDLE, STATES.SLEEPING, STATES.GROOMING, STATES.LOOKING],
  [STATES.SLEEPING]:   [STATES.WALKING, STATES.IDLE, STATES.SITTING],
  [STATES.STRETCHING]: [STATES.WALKING, STATES.IDLE],
  [STATES.GROOMING]:   [STATES.WALKING, STATES.IDLE, STATES.SITTING],
  [STATES.MEOWING]:    [STATES.WALKING, STATES.IDLE, STATES.SITTING],
  [STATES.LOOKING]:    [STATES.WALKING, STATES.IDLE, STATES.SITTING],
};

export class StateMachine {
  constructor(initialState = STATES.IDLE) {
    this._state = initialState;
    this._previous = null;
    this._listeners = [];
  }

  get state() { return this._state; }
  get previous() { return this._previous; }

  canTransition(to) {
    const allowed = TRANSITIONS[this._state];
    return allowed && allowed.includes(to);
  }

  transition(to) {
    if (to === this._state) return false;
    if (!this.canTransition(to)) return false;
    this._previous = this._state;
    const from = this._state;
    this._state = to;
    this._notify(from, to);
    return true;
  }

  onChange(fn) { this._listeners.push(fn); }

  _notify(from, to) {
    for (const fn of this._listeners) {
      fn(from, to);
    }
  }
}
