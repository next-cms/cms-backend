import { combineResolvers } from 'graphql-resolvers';
import { IResolvers } from 'apollo-server-express';
import {debuglog} from "util";
import {isAuthenticated, isAuthorized} from "./Authorization";
import {listAllMedia} from "../core/FileSystemHandler";
const debug = debuglog("pi-cms.resolvers.Gallery");

const GalleryResolver: IResolvers = {
    Query: {
        allMedia: combineResolvers(
            isAuthenticated, isAuthorized, async (parent, {projectId, limit, skip}, context) => {
                return await listAllMedia(projectId, limit, skip);
            }
        )
    },
    Mutation: {

    }
};

export default GalleryResolver;
