import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users } from "../@types/UsersRequests";
import api from "../utils/api";
import endpoints from "../utils/endpoints";

interface UserContextData {
  user: Users | null;
  isLoading: boolean;
  loadUser: () => Promise<void>;
}

export const UserContext = createContext({} as UserContextData);

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<Users | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const loadUser = async () => {
        try {
            setIsLoading(true);

            const id = localStorage.getItem("userId");
            if (!id) throw new Error("User ID not found");

            const response = await api.get(endpoints.usuarios.getById(id));
            
            setUser(response.data.data);
        } catch (error) {
            console.error("Erro ao carregar usuário:", error);
            setUser(null);
            navigate("/login");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadUser();
    }, []);

    return (
        <UserContext.Provider value= {{ user, isLoading, loadUser }
        }>
            { children }
        </UserContext.Provider>
    );
};

export function useUser() {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
}