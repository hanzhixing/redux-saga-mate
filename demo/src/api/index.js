import {normalize, schema} from 'normalizr';
import faker from 'faker';
import {omit, uniq} from 'lodash/fp';
import {delay, repeat} from '../utils';
import {PAGE_SIZE_OF_TODO_LIST} from '../config';
import {MyError} from './errors';

const todo = new schema.Entity('todos');
const user = new schema.Entity('users');

export const noop = ({to}) => delay(3)
    .then(() => {
        if (to === 'success') {
            return;
        }
        throw new MyError(JSON.stringify({
            status: 400,
            statusText: 'Bad Request',
            body: '收藏失败',
        }));
    });

export const getManyTodo = ({page}) => delay(Math.ceil((Math.random() * 2)))
    .then(() => {
        const mockedTodos = [];

        const createTodos = n => {
            const mockedCommenters = [];

            const createCommenters = n => {
                mockedCommenters.push({
                    id: Math.ceil((Math.random() * 20)),
                    name: faker.name.firstName(),
                    utime: (new Date()).toISOString(),
                });
                return n + 1;
            };

            repeat(5)(createCommenters)(1);

            mockedTodos.push({
                id: `${n}${Math.ceil((Math.random() * 2))}`,
                title: `${faker.lorem.word()}-${page}`,
                author: {
                    id: Math.ceil((Math.random() * 20)),
                    name: faker.name.firstName(),
                    utime: (new Date()).toISOString(),
                },
                commenters: uniq(mockedCommenters),
            });
            return n + 1;
        };

        todo.define({
            author: user,
            commenters: [user],
        });

        repeat(PAGE_SIZE_OF_TODO_LIST)(createTodos)(page * PAGE_SIZE_OF_TODO_LIST);

        return {
            request: {
                meta: {page},
            },
            response: {
                ...normalize(mockedTodos, [todo]),
            }
        };
    });


export const patchOneTodo = ({...args}) => delay(Math.ceil((Math.random() * 4)))
    .then(() => {
        const mock = {
            id: args.id,
            star: true,
            utime: (new Date()).toISOString(),
        };

        if (!(Number(args.id) % 3)) {
            throw new MyError(JSON.stringify({
                status: 400,
                statusText: 'Bad Request',
                body: '收藏失败',
            }));
        }

        return {
            request: {
                data: {...omit(['id'], {...args})},
                params: {id: args.id},
            },
            response: {
                ...normalize(mock, todo),
            }
        };
    });

export const getOneUser = ({id}) => delay(Math.ceil((Math.random() * 3)))
    .then(() => {
        const mock = {
            id,
            name: faker.name.firstName(),
            utime: (new Date()).toISOString(),
        };

        return {
            request: {
                params: {id},
            },
            response: {
                ...normalize(mock, user),
            }
        };
    });
