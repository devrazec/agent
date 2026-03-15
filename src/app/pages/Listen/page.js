'use client';

import React, { useState, useRef, useContext, useMemo } from 'react';
import { GlobalContext } from '../../context/GlobalContext';
import Layout from '../../components/Layout';

export default function ListenPage() {
    const {
        darkMode,
        setDarkMode,
        mobileDevice,
        setMobileDevice,
    } = useContext(GlobalContext);

    return (
        <Layout>
            <h1>Listen Page</h1>
        </Layout>
    );
}