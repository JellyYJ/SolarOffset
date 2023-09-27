import React, { useState } from "react";
import styles from "./index.less";

export default function PageContainer({ children }) {
    return (
        <div className={styles.pageContainer}>
            <div className={styles.contentWrapper}>{children}</div>
        </div>
    );
}
