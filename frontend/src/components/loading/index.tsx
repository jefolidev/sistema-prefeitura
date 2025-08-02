import { CSpinner } from '@coreui/react';
import styles from './loading.module.css';

const Loading = () => {
    return (
        <div className={styles.container}>
            <CSpinner/>
        </div>
    );
}

export default Loading;