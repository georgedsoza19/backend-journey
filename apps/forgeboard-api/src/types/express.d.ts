declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
      };
      id?: string;
      membership?: {
        workspaceId: string;
        role: "OWNER" | "ADMIN" | "MEMBER";
      };
    }
  }
}

export {};
