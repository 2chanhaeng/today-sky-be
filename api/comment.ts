import { Router } from "express";
import comment from "@/controller/comment";
const route = Router();

route.post("/:todo_id", comment.post);

export default route;
