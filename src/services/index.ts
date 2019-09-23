import appRoutes from "./app-service/AppRoutes";
import authRoutes from "./auth-service/AuthRoutes";
import projectRoutes from "./project-service/ProjectRoutes";

export default [...authRoutes, ...projectRoutes, ...appRoutes];
