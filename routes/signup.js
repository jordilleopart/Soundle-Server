import { Router } from 'express';
import { Users } from '../database/database.js'

const signupRouter = Router();

// manages incoming sign-up requests
signupRouter.post("/", async (req, res) => {

})


export default signupRouter;