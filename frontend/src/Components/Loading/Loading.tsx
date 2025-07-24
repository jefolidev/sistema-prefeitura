import { CSpinner } from '@coreui/react';
import styles from './Loading.module.css';

const Loading = () => {
    return (
        <div className={styles.container}>
            <CSpinner/>
        </div>
    );
}

export default Loading;