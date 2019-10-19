import { combineResolvers } from 'graphql-resolvers';
import { IResolvers } from 'apollo-server-express';
import {debuglog} from "util";
import {isAuthenticated, isAuthorized, isAuthorizedToRead} from "./Authorization";
import DataObject from "../models/DataObject";
const log = debuglog("pi-cms.resolvers.DataObject");

const DataObjectResolver: IResolvers = {
    Query: {
        allDataObjects: combineResolvers(
            isAuthenticated, isAuthorized, async (parent, {projectId, limit, skip}, context) => {
                return await DataObject.getAll(projectId, limit, skip);
            }
        ),
        allDataObjectsByType: combineResolvers(
            isAuthenticated, isAuthorized, async (parent, {projectId, type, limit, skip}, context) => {
                return await DataObject.getAllByType(projectId, type, limit, skip);
            }
        ),
        dataObjectsBySlug: async (parent, {projectId, slug}, context) => {
            log(projectId, slug);
            return await DataObject.getBySlug(projectId, slug);
        },
        dataObjectsByPostId: combineResolvers(
            isAuthorizedToRead,
            async (parent, {projectId, postId}, context) => {
                log(projectId, postId);
                return await DataObject.getByPostId(projectId, postId);
            }
        ),
        _allDataObjectsMeta: combineResolvers(isAuthenticated, isAuthorized,
            async (parent, {projectId}, {}) => {
                return {
                    count: await DataObject.countDocuments({projectId})
                };
            }
        ),
        _allDataObjectsByTypeMeta: combineResolvers(isAuthenticated, isAuthorized,
            async (parent, {projectId, type}, {}) => {
                return {
                    count: await DataObject.countDocuments({projectId, type})
                };
            }
        )
    },
    Mutation: {
        addDataObject: combineResolvers(
            isAuthenticated, isAuthorized, async (parent, {dataObject}, {}) => {
                let dataObjectToSave = new DataObject(dataObject);
                return dataObjectToSave.save().then(res => {
                    log(res);
                    return res;
                }).catch(err => {
                    log(err);
                    throw err;
                })
            }
        ),
        updateDataObject: combineResolvers(
            isAuthenticated, isAuthorized, async (parent, {dataObject}, {}) => {
                let dataObjectToSave = DataObject.findById(dataObject.id);
                if (!dataObjectToSave) {
                    throw new Error(`DataObject with id ${dataObject.id} not found!`);
                }
                Object.assign(dataObjectToSave, dataObject, {modifiedAt: Date.now()});
                dataObjectToSave.projectId = dataObject.projectId;
                dataObjectToSave.markModified('fields.*');
                dataObjectToSave.markModified('contents.*');
                return dataObjectToSave.save().then(updatedDataObject => {
                    log(updatedDataObject);
                    return updatedDataObject;
                }).catch(err => {
                    log(err);
                    throw err;
                })
            }
        ),
        deleteDataObject: combineResolvers(
            isAuthenticated, isAuthorized, async (parent, {id}, {}) => {
                let dataObject = DataObject.findById(id);
                if (!dataObject) {
                    throw new Error(`DataObject with id ${dataObject.id} not found!`);
                }
                return dataObject.remove().then(deletedDataObject => {
                    log(deletedDataObject);
                    return deletedDataObject;
                }).catch(err => {
                    log(err);
                    throw err;
                })
            }
        )
    }
};

export default DataObjectResolver;
