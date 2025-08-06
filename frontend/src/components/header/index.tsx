import { cilLockLocked, cilMoon, cilPowerStandby, cilSun } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import { CAvatar, CButton, CDropdown, CDropdownDivider, CDropdownItem, CDropdownMenu, CDropdownToggle } from '@coreui/react';
import { useContext } from 'react';
import { RxHamburgerMenu } from 'react-icons/rx';

import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import noProfile from '../../assets/noProfile.png';
import { Context } from '../../auth-context';
import { useUser } from '../../context/user-context';
import api from '../../utils/api';
import endpoints from '../../utils/endpoints';
import styleSidebar from '../sidebar/sidebar.module.css';

const Header = () => {
    const {sidebar, setSidebar, theme, setTheme, setAuthenticated, setLoading, name, userName} = useContext(Context); 
    const { user } = useUser()
    const navigate = useNavigate()

    const isSuperUser = user?.isSuperUser

    const logout = () => {
        setLoading(true);

        api.post(endpoints.user.logout, ).then(() => {
            toast.success("Desconectado com sucesso");
            localStorage.removeItem('token');

            setAuthenticated(false);

        }).catch(error => {
            toast.error("Erro ao desconectar");
            console.log(error)

        }).finally(() => {
            setLoading(false);
        });
    };

    return (
        <div className="header header-sticky p-0">
            <div className={["container-fluid", styleSidebar.sidebarHeaderFixed].join(" ")}>
                <button 
                    type="button" 
                    className="header-toggler"
                    onClick={() => setSidebar(!sidebar)}
                >
                    <RxHamburgerMenu />
                </button>

                <ul className='header-nav ms-auto'>
                    <CButton 
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    >
                        {theme === 'dark'
                            ? <CIcon icon={cilMoon} />
                            : <CIcon icon={cilSun} />
                        }
                    </CButton>
                    <li className="nav-item py-1"><div className="vr h-100 mx-2 text-body text-opacity-75"></div></li>
                </ul>
                <ul className='header-nav'>
                    <CDropdown variant='nav-item'>
                        <CDropdownToggle color="" caret={false}>
                            <CAvatar src={noProfile} />
                        </CDropdownToggle>
                        <CDropdownMenu>
                            <div className='px-2'>
                                <h5>{name}</h5>
                                <h6>{userName}</h6>
                            </div>
                            <CDropdownDivider />
                            {isSuperUser && <CDropdownItem onClick={() => navigate("/permissoes")}> <CIcon icon={cilLockLocked}/> Permissões</CDropdownItem>}
                            <CDropdownItem onClick={logout}><CIcon icon={cilPowerStandby} /> Desconectar</CDropdownItem>
                        </CDropdownMenu>
                    </CDropdown>
                </ul>
            </div>
        </div>
    )
};

export default Header;