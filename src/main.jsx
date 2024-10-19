import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import App from './App.jsx';

import '@mantine/core/styles.css';
import './global.css';

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <MantineProvider>
            <App />
        </MantineProvider>
    </StrictMode>,
);
