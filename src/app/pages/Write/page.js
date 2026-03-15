'use client';

import React, { useState, useRef, useContext, useMemo } from 'react';
import { GlobalContext } from '../../context/GlobalContext';
import Layout from '../../components/Layout';

export default function WritePage() {
    const {
        darkMode,
        setDarkMode,
        mobileDevice,
        setMobileDevice,
    } = useContext(GlobalContext);

    return (
        <Layout>
            <h1>Write Page</h1>
        </Layout>
    );
}