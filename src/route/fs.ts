
import {Router} from "express";
import FileOperationController from "../controller/FileOperationController";


const fsRouter = Router();
fsRouter.get('/fetchMacServer', FileOperationController.fetchPath)
fsRouter.post('/photo', FileOperationController.takePhoto)
fsRouter.get('/photo', FileOperationController.getPhotos)
fsRouter.post('/ffmpeg', FileOperationController.ffmpeg)

export default fsRouter;