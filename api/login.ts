import { Router } from "express";
import login from "@/controller/login";

const route = Router();

route.post("/", login.post);

export default route;
