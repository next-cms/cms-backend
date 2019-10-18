import { combineResolvers } from 'graphql-resolvers';
import { IResolvers } from 'apollo-server-express';
import {debuglog} from "util";
import {isAuthenticated, isAuthorized} from "./Authorization";
import DataModel from "../models/DataModel";
const log = debuglog("pi-cms.resolvers.DataModel");

const DataModelResolver: IResolvers = {
    Query: {
        allDataModels: combineResolvers(
            isAuthenticated, isAuthorized, async (parent, {projectId, limit, skip}, context) => {
                return await DataModel.getAll(projectId, limit, skip);
            }
        ),
        _allDataModelsMeta: combineResolvers(isAuthenticated, isAuthorized,
            async (parent, {projectId}, {}) => {
                return {
                    count: await DataModel.countDocuments({projectId})
                };
            }
        )
    },
    Mutation: {
        addDataModel: combineResolvers(
            isAuthenticated, isAuthorized, async (parent, {dataModel}, {}) => {
                let dataModelToSave = new DataModel(dataModel);
                return dataModelToSave.save().then(res => {
                    log(res);
                    return res;
                }).catch(err => {
                    log(err);
                    throw err;
                })
            }
        ),
        updateDataModel: combineResolvers(
            isAuthenticated, isAuthorized, async (parent, {dataModel}, {}) => {
                let dataModelToSave = DataModel.findById(dataModel.id);
                if (!dataModelToSave) {
                    throw new Error(`DataModel with id ${dataModel.id} not found!`);
                }
                Object.assign(dataModelToSave, dataModel, {modifiedAt: Date.now()});
                dataModelToSave.projectId = dataModel.projectId;
                dataModelToSave.markModified('fields.*');
                dataModelToSave.markModified('contents.*');
                return dataModelToSave.save().then(updatedDataModel => {
                    log(updatedDataModel);
                    return updatedDataModel;
                }).catch(err => {
                    log(err);
                    throw err;
                })
            }
        ),
        deleteDataModel: combineResolvers(
            isAuthenticated, isAuthorized, async (parent, {id}, {}) => {
                let dataModel = DataModel.findById(id);
                if (!dataModel) {
                    throw new Error(`DataModel with id ${dataModel.id} not found!`);
                }
                return DataModel.remove().then(deletedDataModel => {
                    log(deletedDataModel);
                    return deletedDataModel;
                }).catch(err => {
                    log(err);
                    throw err;
                })
            }
        )
    }
};

export default DataModelResolver;
