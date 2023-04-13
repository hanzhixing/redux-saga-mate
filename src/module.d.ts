import type {PlainObject} from 'redux-hyper-action';

declare module 'is-plain-object' {
    export function isPlainObject(o: unknown): o is PlainObject;
}
