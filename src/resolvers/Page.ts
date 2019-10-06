import {combineResolvers} from 'graphql-resolvers';
import {IResolvers} from 'apollo-server-express';
import Page from '../models/Page';

import {isAuthenticated, isAuthorized} from "./Authorization";
import {getProjectPages, getProjectPageDetails, getProjectPageSourceCode} from "../parsers/page-parsers/PageParser";
import {addNewPage, deletePage, saveProjectPageSourceCode} from "../generators/PageGenerator";

const PageResolver: IResolvers = {
    Query: {
        allPages: combineResolvers(isAuthenticated, isAuthorized,
            async (parent, {projectId}, {project}) => {

                // console.debug(pages);
                return await getProjectPages(project.id);
            }
        ),
        page: combineResolvers(isAuthenticated, isAuthorized,
            async (parent, {page}, {project}) => {
                return await getProjectPageDetails(project.id, page);
            }
        ),
        pageSourceCode: combineResolvers(isAuthenticated, isAuthorized,
            async (parent, {page}, {project}) => {
                return await getProjectPageSourceCode(project.id, page);
            }
        )
    },

    Mutation: {
        addPage: combineResolvers(isAuthenticated, isAuthorized,
            async (parent, {projectId}, {user, project}) => {
                try {
                    return addNewPage(project.id).then(res => {
                        return res;
                    }).catch(err => {
                        console.error(err);
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
                        console.error(err);
                        return err;
                    })
                } catch (e) {
                    return e.message;
                }
            }
        ),
        deletePage: combineResolvers(isAuthenticated, isAuthorized,
            async (parent, {projectId, page}, {user}) => {
                return deletePage(projectId, page).then(res => {
                    return res;
                }).catch(err => {
                    console.error(err);
                    return err;
                })
            }
        ),
        savePageSourceCode: combineResolvers(isAuthenticated, isAuthorized,
            async (parent, {sourceCode, page}, {project}) => {
                return await saveProjectPageSourceCode(sourceCode, project.id, page);
            }
        )
    }
};

export default PageResolver;
