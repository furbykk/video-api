import {Router} from "express";
import fsRouter from "./fs";


const rootRouter = Router()
rootRouter.use('/fs', fsRouter)

export default rootRouter