import jwt from 'jsonwebtoken';
import { combineResolvers } from 'graphql-resolvers';
import { AuthenticationError, UserInputError } from 'apollo-server-express';

import { isAdmin, isAuthenticated } from './authorization';
import User from "../model/User";

const createToken = async (user, secret, expiresIn) => {
    const { id, email, name, role } = user;
    return await jwt.sign({ id, email, name, role }, secret, {
        expiresIn,
    });
};

export default {
    Query: {
        users: async (parent, args, context) => {
            return await User.find();
        },
        user: async (parent, { id }, context) => {
            return await User.findById(id);
        },
        currentUser: async (parent, args, {user}) => {
            if (!user) {
                return null;
            }

            return await User.findById(user.id);
        },
    },

    Mutation: {
        signUp: async (
            parent,
            { name, email, password },
            context,
        ) => {
            try {
                const user = new User({name, email, password});
                return user.save().then(res => {
                    return res;
                }).catch(err => {
                    console.log(err)
                    return err;
                })
            } catch (e) {
                return e.message;
            }
        },

        signIn: async (
            parent,
            { email, password },
            {secret},
        ) => {
            const user = await User.findOne({email});

            if (!user) {
                throw new UserInputError(
                    'No user found with this login credentials.',
                );
            }

            const isValid = await user.validatePassword(password);

            if (!isValid) {
                throw new AuthenticationError('Invalid password.');
            }

            return { token: createToken(user, secret, '30m') };
        },

        updateUser: combineResolvers(
            isAuthenticated,
            async (parent, { name, email, password }, { user }) => {
                return await User.findByIdAndUpdate(
                    user.id,
                    { name, email, password },
                    { new: true },
                );
            },
        ),

        deleteUser: combineResolvers(
            isAdmin,
            async (parent, { id }, { admin }) => {
                const user = await User.findById(id);

                if (user) {
                    await user.remove();
                    return true;
                } else {
                    return false;
                }
            },
        ),
    }
};
