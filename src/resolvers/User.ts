import { combineResolvers } from 'graphql-resolvers';
import { AuthenticationError, IResolverObject, IResolvers, UserInputError } from 'apollo-server-express';

import { isAdmin, isAuthenticated } from './Authorization';
import User from "../model/User";
import { createToken } from "../utils/securityUtils";

const UserResolver: IResolvers = {
    Query: {
        users: async (parent, args, context) => {
            return await User.find();
        },
        user: async (parent, { id }, context) => {
            return await User.findById(id);
        },
        currentUser: async (parent, args, { user }) => {
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
                let user = null;
                // console.log(await User.count({}));
                if (await User.countDocuments({}) === 0) {
                    user = new User({ name, email, password, role: "ADMIN" });
                } else {
                    user = new User({ name, email, password, role: "USER" });
                }
                return user.save().then(res => {
                    return res;
                }).catch(err => {
                    console.log(err);
                    return err;
                })
            } catch (e) {
                return e.message;
            }
        },

        signIn: async (
            parent,
            { email, password },
            { secret },
        ) => {
            const user = await User.findOne({ email });

            if (!user) {
                throw new UserInputError(
                    'No user found with this login credentials.',
                );
            }

            const isValid = await user.validatePassword(password);

            if (!isValid) {
                throw new AuthenticationError('Invalid password.');
            }

            return { token: createToken(user, secret, '24h') };
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
            async (parent, { id }, { user }) => {
                const userInDB = await User.findById(id);

                if (userInDB) {
                    await userInDB.remove();
                    return true;
                } else {
                    return false;
                }
            },
        ),
    }
};

export default UserResolver;
