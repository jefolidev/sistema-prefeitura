import { CSidebar, CSidebarBrand, CSidebarHeader, CSidebarNav } from '@coreui/react';
import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logoImage from '../../assets/logo.png';
import { Context } from '../../AuthContext';
import styles from './Sidebar.module.css';

import { FaServer, FaSitemap, FaUserTie, FaUsers } from 'react-icons/fa';
import { FiFileText, FiPackage, FiTruck } from 'react-icons/fi';
import { MdDashboard } from 'react-icons/md';
import { Users } from '../../@types/UsersRequests';
import { useUser } from '../../context/UserContext';

const Sidebar = () => {
    const navigate = useNavigate();
    const { sidebar } = useContext(Context);
    const [link, setLink] = useState<string>("/");

    const { user } = useUser();

    useEffect(() => {
        setLink(location.pathname);
    }, [location.pathname]);
    
    const canAccessRoute = (user: Users | null, routePath: string): boolean => {
        if (!user) return false;
        if (!Array.isArray(user.permissions)) return false; // protege se não tiver permissions

        const isSuperUser = localStorage.getItem("isSuperAdmin");
        if (isSuperUser === "true") return true;

        const hasRestriction = user.permissions.some(userPerm => {
            if (!userPerm.isEnabled) return false;
            return userPerm.permission.routesToRestrict?.includes(routePath);
        });

        return !hasRestriction;
    };


    return (
        <CSidebar className={['border-end', styles.sidebar].join(" ")} visible={sidebar}>
            <CSidebarHeader className='justify-content-center'>
                <CSidebarBrand className='fs-3'>
                    <img src={logoImage} width={150} />
                </CSidebarBrand>
            </CSidebarHeader>
            <CSidebarNav>
                <div className='nav-item' onClick={() => navigate("/")}>
                    <span className={['nav-link', link === "/" ? "active" : ""].join(" ")}>
                        <MdDashboard className='fs-2 pe-2' /> Dashboard
                    </span>
                </div>

                {canAccessRoute(user, "fornecedores") && (
                    <div className='nav-item' onClick={() => navigate("/fornecedores")}>
                        <span className={['nav-link', link.includes("/fornecedores") ? "active" : ""].join(" ")}>
                            <FiTruck className='fs-2 pe-2' /> Fornecedores
                        </span>
                    </div>
                )}

                {canAccessRoute(user, "usuarios") && (
                    <div className='nav-item' onClick={() => navigate("/usuarios")}>
                        <span className={['nav-link', link.includes("/usuarios") ? "active" : ""].join(" ")}>
                            <FaUserTie className='fs-2 pe-2' /> Usuários
                        </span>
                    </div>
                )}

                {canAccessRoute(user, "servidores") && (
                    <div className='nav-item' onClick={() => navigate("/servidores")}>
                        <span className={['nav-link', link.includes("/servidores") ? "active" : ""].join(" ")}>
                            <FaServer className='fs-2 pe-2' /> Servidores
                        </span>
                    </div>
                )}

                {canAccessRoute(user, "produtos") && (
                    <div className='nav-item' onClick={() => navigate("/produtos")}>
                        <span className={['nav-link', link.includes("/produtos") ? "active" : ""].join(" ")}>
                            <FiPackage className='fs-2 pe-2' /> Produtos
                        </span>
                    </div>
                )}

                {canAccessRoute(user, "departamentos") && (
                    <div className='nav-item' onClick={() => navigate("/departamentos")}>
                        <span className={['nav-link', link.includes("/departamentos") ? "active" : ""].join(" ")}>
                            <FaSitemap className='fs-2 pe-2' /> Departamentos
                        </span>
                    </div>
                )}

                {canAccessRoute(user, "grupos") && (
                    <div className='nav-item' onClick={() => navigate("/grupos")}>
                        <span className={['nav-link', link.includes("/grupos") ? "active" : ""].join(" ")}>
                            <FaUsers className='fs-2 pe-2' /> Grupos
                        </span>
                    </div>
                )}

                {canAccessRoute(user, "requisicoes") && (
                    <div className='nav-item' onClick={() => navigate("/requisicoes")}>
                        <span className={['nav-link', link.includes("/requisicoes") ? "active" : ""].join(" ")}>
                            <FiFileText className='fs-2 pe-2' /> Requisições
                        </span>
                    </div>
                )}
            </CSidebarNav>
        </CSidebar>
    );
};

export default Sidebar;
