import {normalize, schema} from 'normalizr';
import {Random} from 'mockjs';
import {omit, uniq} from 'lodash/fp';
import {delay, repeat} from '../utils';
import {PAGE_SIZE_OF_POST_LIST} from '../config';
import {MyError} from './errors';

const post = new schema.Entity('posts');
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

export const getManyPost = ({page}) => delay(Math.ceil((Math.random() * 2)))
    .then(() => {
        const mockedPosts = [];

        const createPosts = n => {
            const mockedCommenters = [];

            const createCommenters = n => {
                mockedCommenters.push({
                    id: Math.ceil((Math.random() * 20)),
                    fullName: Random.name(),
                    utime: (new Date()).toISOString(),
                });
                return n + 1;
            };

            repeat(5)(createCommenters)(1);

            mockedPosts.push({
                id: `${n}${Math.ceil((Math.random() * 2))}`,
                title: `${Random.title().substring(0, 16)}-${page}`,
                author: {
                    id: Math.ceil((Math.random() * 20)),
                    fullName: Random.name(),
                    utime: (new Date()).toISOString(),
                },
                commenters: uniq(mockedCommenters),
                email: Random.email().substring(0,10),
            });
            return n + 1;
        };

        post.define({
            author: user,
            commenters: [user],
        });

        repeat(PAGE_SIZE_OF_POST_LIST)(createPosts)(page * PAGE_SIZE_OF_POST_LIST);

        return {
            request: {
                meta: {page},
            },
            response: {
                ...normalize(mockedPosts, [post]),
            }
        };
    });


export const patchOnePost = ({...args}) => delay(Math.ceil((Math.random() * 4)))
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
                ...normalize(mock, post),
            }
        };
    });

export const getOneUser = ({id}) => delay(Math.ceil((Math.random() * 3)))
    .then(() => {
        const mock = {
            id,
            fullName: Random.name(),
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
