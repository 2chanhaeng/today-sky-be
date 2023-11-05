import { Router } from "express";
import refresh from "@/controller/refresh";

const route = Router();

route.post("/", refresh.post);

export default route;
