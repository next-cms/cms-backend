import { combineResolvers } from 'graphql-resolvers';
import { IResolvers, UserInputError } from 'apollo-server-express';
import NavHeader from '../model/NavHeader';


/* Todo:
    Need to add authentication by using combineResolvers
*/

// import { isAdmin, isAuthenticated } from "./Authorization";

const NavHeaderResolver: IResolvers = {
    Query: {
        getAllHeader: async (parent, { limit, skip }, context) => {
            return await NavHeader.getAllHeader(limit, skip);
        }
    },

    Mutation: {
        addHeader: async (parent, { title }, { user }) => {
            try {
                let navHeader = new NavHeader({ title });
                return navHeader.save().then(res => {
                    return res;
                }).catch(err => {
                    console.log(err);
                    return err;
                })
            } catch (e) {
                return e.message;
            }
        },
        updateHeader: async (parent, { id, title }, { user }) => {
            try {
                return NavHeader.findByIdAndUpdate(id, { title, modifiedAt: Date.now() }, { new: true }).then(res => {
                    return res;
                }).catch(err => {
                    console.log(err);
                    return err;
                })
            } catch (e) {
                return e.message;
            }
        },
        deleteHeader: async (parent, { id }, { user }) => {
            const navHeader = await NavHeader.findById(id);

            if (navHeader) {
                await navHeader.remove();
                return true;
            } else {
                return false;
            }
        },
    }
};

export default NavHeaderResolver;
