import {Request, Response} from "express";
import path from "path";
import {PROJECT_ROOT} from "../../constants/DirectoryStructureConstants";
import next from "next";
import {URL} from "url";
import {getNextServerConfig} from "./NextConfig";
import {deployProjectInDockerWithNginx} from "../../project-manager";
import Project from "../../models/Project";

class ProjectController {
    static timeouts = {};
    static apps = {};
    static async loadProject(req: Request, res: Response) {
        try {
            const projectId = req.query.projectId;
            if (!projectId) return res.send({error: true, message: "projectId is undefined"});
            const projectDir = path.join(PROJECT_ROOT, projectId);

            const {app, handle, cached} = await ProjectController.getNextHandle(projectId, projectDir);

            return await app.render(req, res, '/index');
        } catch (e) {
            console.error(e);
        }
    }
    static async deployProject(req: Request, res: Response) {
        req.setTimeout(0, ()=>{console.log("timeout callback called")}); // no timeout
        try {
            const projectId = req.query.projectId;
            if (!projectId) return res.send({error: true, message: "projectId is undefined"});
            const project = await Project.findById(projectId);
            console.log("project is: ", project);
            return deployProjectInDockerWithNginx(project).then((result)=>{
                return res.send("Success!");
            });
        } catch (e) {
            console.error(e);
        }
    }
    static async getNextHandle(projectId, projectDir) {
        let cached = true;
        if (!ProjectController.apps[projectId]) {
            const app = await next({ dir: projectDir, dev: true, conf: getNextServerConfig(projectDir) });
            ProjectController.apps[projectId] = {
                app: app,
                handle: app.getRequestHandler()
            };
            await app.prepare();
            cached = false;
        }
        ProjectController.configureCleanUp(projectId);
        return {app: ProjectController.apps[projectId].app, handle: ProjectController.apps[projectId].handle, cached};
    }
    static async loadProjectPage(req: Request, res: Response) {
        try {
            const projectId = req.query.projectId;
            if (!projectId) return res.send({error: true, message: "projectId is undefined"});
            const page = req.params.page;
            const projectDir = path.join(PROJECT_ROOT, projectId);

            const {app, handle, cached} = await ProjectController.getNextHandle(projectId, projectDir);

            return await app.render(req, res, `/${page}`);
        } catch (e) {
            console.error(e);
        }
    }
    static async handleNextJSRequest(req: Request, res: Response) {
        try {
            const projectId = (req.header('Referer') ? new URL(req.header('Referer')).searchParams.get('projectId') : null) || req.query.projectId;
            if (!projectId) return res.send({error: true, message: "projectId is undefined"});
            const projectDir = path.join(PROJECT_ROOT, projectId);

            const {app, handle, cached} = await ProjectController.getNextHandle(projectId, projectDir);

            return await handle(req, res);
        } catch (e) {
            console.error(e);
        }
    }
    static async handleStaticFileRequest(req: Request, res: Response) {
        try {
            const projectId = (req.header('Referer') ? new URL(req.header('Referer')).searchParams.get('projectId') : null) || req.query.projectId;
            if (!projectId) return res.send({error: true, message: "projectId is undefined"});
            const projectDir = path.join(PROJECT_ROOT, projectId);

            // const {app, handle, cached} = await ProjectController.getNextHandle(projectId, projectDir);

            console.log(path.resolve("."+req.path.substr("/next-project".length)));
            return res.status(200).sendFile(decodeURIComponent(path.resolve(`./${projectDir}/public/${req.path.substr("/next-project".length)}`)));
        } catch (e) {
            console.error(e);
        }
    }

    static async handleHMR(req: Request, res: Response) {
        const projectId = (req.header('Referer') ? new URL(req.header('Referer')).searchParams.get('projectId') : null) || req.query.projectId;
        if (!projectId) return res.send({error: true, message: "projectId is undefined"});
        ProjectController.configureCleanUp(projectId);
        return await res.type('text/event-stream').send("{success: true}");
    }

    static async handleServiceWorkerRequest(req: Request, res: Response) {
        const projectId = (req.header('Referer') ? new URL(req.header('Referer')).searchParams.get('projectId') : null) || req.query.projectId;
        if (!projectId) return res.send({error: true, message: "projectId is undefined"});
        ProjectController.configureCleanUp(projectId);
        return await res.send("{message: \"Not Supported or Required while designing your site.\"}");
    }

    static cleanUp(exitCode) {
        console.log("Exit with code: ", exitCode);
        Object.keys(ProjectController.timeouts).forEach((key)=>{
            clearTimeout(ProjectController.timeouts[key]);
            delete ProjectController.timeouts[key]
        });
        Object.keys(ProjectController.apps).forEach((key)=>{
            console.log('ProjectController.apps', key);
            ProjectController.apps[key].close();
            delete ProjectController.apps[key]
        });
        console.log("Bye bye!");
        process.exit();
    }

    static configureCleanUp(projectId) {
        if (ProjectController.timeouts[projectId]) {
            clearTimeout(ProjectController.timeouts[projectId]);
            delete ProjectController.timeouts[projectId];
        }
        // @ts-ignore
        ProjectController.timeouts[projectId] = setTimeout(()=>{
            if (ProjectController.apps[projectId]) {
                ProjectController.apps[projectId].app.close();
                delete ProjectController.apps[projectId];
            }
        }, 10*60*1000);
    }
}

export default ProjectController;
