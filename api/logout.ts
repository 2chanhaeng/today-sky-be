import { Router } from "express";
import logout from "@/controller/logout";

const route = Router();

route.get("/", logout.get);

export default route;
