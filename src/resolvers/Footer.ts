import { combineResolvers } from 'graphql-resolvers';
import { IResolvers, UserInputError } from 'apollo-server-express';
import Footer from '../models/Footer';


/* Todo:
    Need to add authentication by using combineResolvers
*/


// import { isAdmin, isAuthenticated } from "./Authorization";

const FooterResolver: IResolvers = {
    Query: {
        getAllFooter: async (parent, { limit, skip }, context) => {
            return await Footer.getAllFooter(limit, skip);
        }
    },

    Mutation: {
        addFooter: async (parent, { title }, { user }) => {
            try {
                let footer = new Footer({ title });
                return footer.save().then(res => {
                    return res;
                }).catch(err => {
                    console.log(err);
                    return err;
                })
            } catch (e) {
                return e.message;
            }
        },
        updateFooter: async (parent, { id, title }, { user }) => {
            try {
                return Footer.findByIdAndUpdate(id, { title, modifiedAt: Date.now() }, { new: true }).then(res => {
                    return res;
                }).catch(err => {
                    console.log(err);
                    return err;
                })
            } catch (e) {
                return e.message;
            }
        },
        deleteFooter: async (parent, { id }, { user }) => {
            const footer = await Footer.findById(id);

            if (footer) {
                await footer.remove();
                return true;
            } else {
                return false;
            }
        },
    }
};

export default FooterResolver;
