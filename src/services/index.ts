import appRoutes from "./app-service/AppRoutes";
import authRoutes from "./auth-service/AuthRoutes";
import projectRoutes from "./project-service/ProjectRoutes";
import fileRoutes from "./file-service/FileRoutes";

export default [...authRoutes, ...projectRoutes, ...appRoutes, ...fileRoutes];
