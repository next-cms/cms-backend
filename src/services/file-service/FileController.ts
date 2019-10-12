import {Request, Response} from "express";
import multer from 'multer';
import {SUPPORTED_IMAGE_EXTENSIONS_REGEX} from "../../constants/FileConstants";
import fse from "fs-extra";
import {PROJECT_ROOT} from "../../constants/DirectoryStructureConstants";
import * as path from "path";

const imageFilter = (req, file, cb) => {
    // accept image only
    if (!file.originalname.match(SUPPORTED_IMAGE_EXTENSIONS_REGEX)) {
        return cb(new Error("Only image files are allowed!"), false);
    }
    cb(null, true);
};

class FileController {
    static async uploadImage(req: Request|any, res: Response) {
        const projectId = req.query.projectId;
        const imageUpload = multer({
            storage: multer.diskStorage({
                destination: (req, file, cb) => {
                    const dir = path.join(PROJECT_ROOT, projectId, "static/images/");
                    if (!fse.existsSync(dir)) {
                        console.log(`${dir} folder not exist!`);
                        fse.mkdirSync(dir, { recursive: true });
                    } else {
                        console.log(`${dir} folder exist!`);
                    }
                    cb(null, dir);
                },
                filename: (req, file, cb) => {
                    cb(null, `${new Date().toISOString()}_${file.originalname}`);
                }
            }),
            limits: {
                fileSize: 1024 * 1024 * 5
            },
            fileFilter: imageFilter
        });
        return imageUpload.single('file')(req, res, ()=>{
            res.send(req.file);
        });
    }
    static async uploadImages(req: Request|any, res: Response) {
        const projectId = req.query.projectId;
        const imageUpload = multer({
            storage: multer.diskStorage({
                destination: (req, file, cb) => {
                    const dir = path.join(PROJECT_ROOT, projectId, "static/images/");
                    if (!fse.existsSync(dir)) {
                        console.log(`${dir} folder not exist!`);
                        fse.mkdirSync(dir, { recursive: true });
                    } else {
                        console.log(`${dir} folder exist!`);
                    }
                    cb(null, dir);
                },
                filename: (req, file, cb) => {
                    cb(null, `${new Date().toISOString()}_${file.originalname}`);
                }
            }),
            limits: {
                fileSize: 1024 * 1024 * 5
            },
            fileFilter: imageFilter
        });
        return imageUpload.array('fileList')(req, res, ()=>{
            res.send(req.fileList);
        });
    }
}

export default FileController;
