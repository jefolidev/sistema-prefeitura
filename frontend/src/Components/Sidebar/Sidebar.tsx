import { useContext, useEffect, useState } from 'react';
import logoImage from '../../assets/logo.png';
import { CSidebar, CSidebarBrand, CSidebarHeader, CSidebarNav } from '@coreui/react';
// import { useNavigate } from 'react-router-dom';

import { Context } from '../../AuthContext';
import styles from './Sidebar.module.css';
import { useNavigate } from 'react-router-dom';
import { MdDashboard } from 'react-icons/md';
import { FiPackage, FiTruck, FiFileText } from 'react-icons/fi';
import { FaSitemap, FaUserTie, FaUsers, FaServer } from 'react-icons/fa';

const Sidebar = () => {
    const navigate = useNavigate();

    const { sidebar } = useContext(Context);

    const [link, setLink] = useState<string>("/");
    useEffect(() => {
        setLink(location.pathname);
    }, [location.pathname])

    return(
        <CSidebar className={['border-end', styles.sidebar].join(" ")} visible={sidebar}>
            <CSidebarHeader className='justify-content-center'>
                <CSidebarBrand className='fs-3'>
                    <img src={logoImage} width={150}/>
                </CSidebarBrand>
            </CSidebarHeader>
            <CSidebarNav>
                <div className='nav-item' onClick={() => {navigate("/")}}>
                    <span className={[
                        'nav-link',
                        link == "/" ? "active" : "",
                    ].join(" ")}>
                        <MdDashboard className='fs-2 pe-2'/> Dashboard
                    </span>
                </div>
                <div className='nav-item' onClick={() => {navigate("/fornecedores")}}>
                    <span className={[
                        'nav-link',
                        link.includes("/fornecedores") ? "active" : "",
                    ].join(" ")}>
                        <FiTruck className='fs-2 pe-2'/> Fornecedores
                    </span>
                </div>
                <div className='nav-item' onClick={() => {navigate("/usuarios")}}>
                    <span className={[
                        'nav-link',
                        link.includes("/usuarios") ? "active" : ""
                    ].join(" ")}>
                        <FaUserTie className='fs-2 pe-2'/> Usuários
                    </span>
                </div>
                <div className='nav-item' onClick={() => {navigate("/servidores")}}>
                    <span className={[
                        'nav-link',
                        link.includes("/servidores") ? "active" : ""
                    ].join(" ")}>
                        <FaServer className='fs-2 pe-2'/> Servidores
                    </span>
                </div>
                <div className='nav-item' onClick={() => {navigate("/produtos")}}>
                    <span className={[
                        'nav-link',
                        link.includes("/produtos") ? "active" : "",
                    ].join(" ")}>
                        <FiPackage className='fs-2 pe-2'/> Produtos
                    </span>
                </div>
                <div className='nav-item' onClick={() => {navigate("/departamentos")}}>
                    <span className={[
                        'nav-link',
                        link.includes("/departamentos") ? "active" : "",
                    ].join(" ")}>
                        <FaSitemap className='fs-2 pe-2'/> Departamentos
                    </span>
                </div>
                <div className='nav-item' onClick={() => {navigate("/grupos")}}>
                    <span className={[
                        'nav-link',
                        link.includes("/grupos") ? "active" : "",
                    ].join(" ")}>
                        <FaUsers className='fs-2 pe-2'/> Grupos
                    </span>
                </div>
                <div className='nav-item' onClick={() => {navigate("/requisicoes")}}>
                    <span className={[
                        'nav-link',
                        link.includes("/requisicoes") ? "active" : "",
                    ].join(" ")}>
                        <FiFileText className='fs-2 pe-2'/> Requisições
                    </span>
                </div>
            </CSidebarNav>
        </CSidebar>
    );

};

export default Sidebar;