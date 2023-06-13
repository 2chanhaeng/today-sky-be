import { Router } from "express";
import signup from "@/controller/signup";

const route = Router();

route.get("/is-dupl", signup.isDupl);

export default route;
