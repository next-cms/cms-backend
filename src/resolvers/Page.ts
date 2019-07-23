import {combineResolvers} from 'graphql-resolvers';
import {IResolvers} from 'apollo-server-express';
import Page from '../model/Page';

import {isAuthenticated, isAuthorized} from "./Authorization";

const PageResolver: IResolvers = {
    Query: {
        getAllPage: combineResolvers(isAuthenticated, isAuthorized,
            async (parent, {projectId, limit, skip}, context) => {
                return await Page.getAllPage(projectId, limit, skip);
            }
        )
    },

    Mutation: {
        addPage: combineResolvers(isAuthenticated, isAuthorized,
            async (parent, {projectId, title}, {user}) => {
                try {
                    let page = new Page({title});
                    return page.save().then(res => {
                        return res;
                    }).catch(err => {
                        console.log(err);
                        return err;
                    })
                } catch (e) {
                    return e.message;
                }
            }
        ),
        updatePage: combineResolvers(isAuthenticated, isAuthorized,
            async (parent, {projectId, id, title}, {user}) => {
                try {
                    return Page.findByIdAndUpdate(id, {title, modifiedAt: Date.now()}, {new: true}).then(res => {
                        return res;
                    }).catch(err => {
                        console.log(err);
                        return err;
                    })
                } catch (e) {
                    return e.message;
                }
            }
        ),
        deletePage: combineResolvers(isAuthenticated, isAuthorized,
            async (parent, {projectId, id}, {user}) => {
                const page = await Page.findById(id);

                if (page) {
                    await page.remove();
                    return true;
                } else {
                    return false;
                }
            }
        ),
    }
};

export default PageResolver;
