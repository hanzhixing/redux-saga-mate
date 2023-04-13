import {normalize, schema} from 'normalizr';
import {faker} from '@faker-js/faker';
import {omit, uniq} from 'ramda';
import {delay, repeat} from '../utils';
import {PAGE_SIZE_OF_TODO_LIST} from '../constants/config';

export const todo = new schema.Entity('todos');
const user = new schema.Entity('users');
