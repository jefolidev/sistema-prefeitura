import { useEffect, useState } from "react";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { Context } from "./auth-context";
import Loading from "./components/loading";
import { UserProvider } from "./context/user-context";
import AuthenticatedRoutes from "./routes/authenticated";
import NotAuthenticatedRoutes from "./routes/notAuthenticated";


const App = () => {

    const [authenticated, setAuthenticated] = useState<boolean|null>(null);
    const [theme, setTheme] = useState<'light'|'dark'>('light');
    const [sidebar, setSidebar] = useState<boolean>(true);
    const [loading, setLoading] = useState<boolean>(false);
    const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(false);
    const [name, setName] = useState<string>('');
    const [userName, setUserName] = useState<string>('');

    useEffect(() => {
        document.querySelector('html')?.setAttribute('data-coreui-theme', theme);
    }, [theme]);

    useEffect(() => {
        if(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches){
            setTheme('dark');
        }else{
            setTheme('light');
        }

        if(localStorage.getItem('token')){
            const token = localStorage.getItem('token');
            
            if(!token) return;
            const payload = JSON.parse(atob(token.split('.')[1]));
            setIsSuperAdmin(payload.isSuperAdmin);
            setName(payload.nome);
            setUserName(payload.string);
            setAuthenticated(true)
        }else{
            setAuthenticated(false);
        }
    }, [])

    return (
        <BrowserRouter>
            <UserProvider>

                <Context.Provider value={{
                    setAuthenticated,
                    sidebar, setSidebar,
                    theme, setTheme,
                    loading, setLoading,
                    isSuperAdmin, name,
                    userName
                }}>
                    {authenticated === null ? <Loading />: (
                        authenticated ? (<AuthenticatedRoutes />): (<NotAuthenticatedRoutes />)
                    )}
                </Context.Provider>
                <ToastContainer />
            
                {loading && <Loading />}
            </UserProvider>
        </BrowserRouter>
    )
}

export default App
