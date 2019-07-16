import { combineResolvers } from 'graphql-resolvers';
import { IResolvers, UserInputError } from 'apollo-server-express';
import Page from '../model/Page';


/* Todo:
    Need to add authentication by using combineResolvers
*/


// import { isAdmin, isAuthenticated } from "./Authorization";

const PageResolver: IResolvers = {
    Query: {
        getAllPage: async (parent, { limit, skip }, context) => {
            return await Page.getAllPage(limit, skip);
        }
    },

    Mutation: {
        addPage: async (parent, { title }, { user }) => {
            try {
                let page = new Page({ title });
                return page.save().then(res => {
                    return res;
                }).catch(err => {
                    console.log(err);
                    return err;
                })
            } catch (e) {
                return e.message;
            }
        },
        updatePage: async (parent, { id, title }, { user }) => {
            try {
                return Page.findByIdAndUpdate(id, { title, modifiedAt: Date.now() }, { new: true }).then(res => {
                    return res;
                }).catch(err => {
                    console.log(err);
                    return err;
                })
            } catch (e) {
                return e.message;
            }
        },
        deletePage: async (parent, { id }, { user }) => {
            const page = await Page.findById(id);

            if (page) {
                await page.remove();
                return true;
            } else {
                return false;
            }
        },
    }
};

export default PageResolver;
