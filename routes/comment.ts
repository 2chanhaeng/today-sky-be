import { Router } from "express";
import todo from "@/controller/comment";

const route = Router();
//투두 comment
route.post("/:year/:month/:day/comment", todo.post);
route.put("/:year/:month/:day/comment", todo.put);
route.delete("/:year/:month/:day/comment", todo.destroy);
export default route;
