import {Request, Response} from "express";
import path from "path";
import {PROJECT_FRONTEND, PROJECT_ROOT} from "../../constants/DirectoryStructureConstants";
import next from "next";
import {URL} from "url";

class ProjectController {
    static timeouts = {};
    static apps = {};
    static async loadProject(req: Request, res: Response) {
        try {
            const projectId = req.query.projectId;
            if (!projectId) return res.send({error: true, message: "projectId is undefined"});
            const projectDir = path.join(PROJECT_ROOT, projectId, PROJECT_FRONTEND);

            const {app, handle} = await ProjectController.getNextHandle(projectId, projectDir);

            return app.render(req, res, '/index').then(()=>ProjectController.configureCleanUp(projectId));
        } catch (e) {
            console.error(e);
        }
    }
    static async getNextHandle(projectId, projectDir) {
        if (!ProjectController.apps[projectId]) {
            ProjectController.apps[projectId] = {};
            ProjectController.apps[projectId].app = next({ dir: projectDir, dev: true });
            ProjectController.apps[projectId].handle = ProjectController.apps[projectId].app.getRequestHandler();
            await ProjectController.apps[projectId].app.prepare();
        }
        return {app: ProjectController.apps[projectId].app, handle: ProjectController.apps[projectId].handle};
    }
    static async loadProjectPage(req: Request, res: Response) {
        try {
            const projectId = req.query.projectId;
            if (!projectId) return res.send({error: true, message: "projectId is undefined"});
            const page = req.params.page;
            const projectDir = path.join(PROJECT_ROOT, projectId, PROJECT_FRONTEND);

            const {app, handle} = await ProjectController.getNextHandle(projectId, projectDir);

            return app.render(req, res, `/${page}`).then(()=>ProjectController.configureCleanUp(projectId));
        } catch (e) {
            console.error(e);
        }
    }
    static async handleNextJSRequest(req: Request, res: Response) {
        try {
            const projectId = (req.header('Referer') ? new URL(req.header('Referer')).searchParams.get('projectId') : null) || req.query.projectId;
            if (!projectId) return res.send({error: true, message: "projectId is undefined"});
            const projectDir = path.join(PROJECT_ROOT, projectId, PROJECT_FRONTEND);

            const {app, handle} = await ProjectController.getNextHandle(projectId, projectDir);
            return handle(req, res).then(()=>ProjectController.configureCleanUp(projectId));
        } catch (e) {
            console.error(e);
        }
    }

    static async handleHMR(req: Request, res: Response) {
        res.type('text/event-stream').send("{success: true}");
    }

    static cleanUp(exitCode) {
        console.log("Exit with code: ", exitCode);
        Object.keys(ProjectController.timeouts).forEach((key)=>{
            clearTimeout(ProjectController.timeouts[key]);
            delete ProjectController.timeouts[key]
        });
        Object.keys(ProjectController.apps).forEach((key)=>{
            if (!ProjectController.apps[key]) {
                delete ProjectController.apps[key];
                return
            }
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
            ProjectController.apps[projectId].app.close();
            delete ProjectController.apps[projectId];
        }, 10*60*1000);
    }
}

export default ProjectController;
