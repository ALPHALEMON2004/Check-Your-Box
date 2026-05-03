import { Router } from "express";
import {oidcConfigHandeler,jwksHandeler,userInfoHandeler} from "../controllers/oidc.controller.js";

const router = Router();

router.get("/.well-known/openid-configuration",oidcConfigHandeler);

router.get("/.well-known/jwks.json",jwksHandeler);

router.get("/o/userinfo",userInfoHandeler);





export default router;