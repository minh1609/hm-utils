import { useState, useCallback, useEffect } from 'react';
import { Box, Button, Chip, CircularProgress, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import LoginIcon from '@mui/icons-material/Login';
import { fetchFolderDocTabs, type DocTab } from '../utils/googleRest.ts';
import { useGoogleAuth } from '../hooks/useGoogleAuth.ts';

const FOLDER_ID = import.meta.env.VITE_GOOGLE_FOLDER_ID as string;

type FetchState = 'idle' | 'loading' | 'ready' | 'error';

export function RandomTopicWidget() {
    const { login, accessToken, authState, authError, clearToken } = useGoogleAuth();

    const [tabs, setTabs] = useState<DocTab[]>([]);
    const [fetchState, setFetchState] = useState<FetchState>('idle');
    const [fetchError, setFetchError] = useState('');
    const [pickedTab, setPickedTab] = useState<DocTab | null>(null);

    // Auto-fetch tabs whenever we have a valid token.
    useEffect(() => {
        if (!accessToken) return;
        setFetchState('loading');
        setFetchError('');

        fetchFolderDocTabs(FOLDER_ID, accessToken)
            .then((allTabs) => {
                setTabs(allTabs);
                setFetchState('ready');
            })
            .catch((err: unknown) => {
                setFetchError(err instanceof Error ? err.message : 'Failed to fetch tabs');
                setFetchState('error');
            });
    }, [accessToken]);

    const pickRandom = useCallback(() => {
        if (tabs.length === 0) return;
        const idx = Math.floor(Math.random() * tabs.length);
        setPickedTab(tabs[idx]);
    }, [tabs]);

    // Still reading from localStorage on first render
    if (authState === 'checking') {
        return (
            <Stack direction="row" spacing={1} alignItems="center">
                <CircularProgress size={20} />
                <Typography variant="body2" color="text.secondary">
                    Restoring session…
                </Typography>
            </Stack>
        );
    }

    // Not signed in
    if (authState === 'idle' || authState === 'error') {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                <Button variant="contained" startIcon={<LoginIcon />} onClick={() => login()}>
                    Sign in with Google
                </Button>
                {authState === 'error' && (
                    <Typography variant="caption" color="error">
                        {authError}
                    </Typography>
                )}
            </Box>
        );
    }

    // Signed in — show fetch state + random topic button
    return (
        <>
            <div>
                <h1>Random Topic</h1>
                <p>Pick a random topic from your Google Drive</p>
            </div>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                {fetchState === 'loading' && (
                    <Stack direction="row" spacing={1} alignItems="center">
                        <CircularProgress size={20} />
                        <Typography variant="body2" color="text.secondary">
                            Fetching tabs from Drive…
                        </Typography>
                    </Stack>
                )}

                {fetchState === 'error' && (
                    <>
                        <Typography variant="body2" color="error">
                            {fetchError}
                        </Typography>
                        <Button variant="outlined" size="small" onClick={() => login()}>
                            Retry sign-in
                        </Button>
                    </>
                )}

                {fetchState === 'ready' && (
                    <>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Button
                                variant="contained"
                                startIcon={<ShuffleIcon />}
                                onClick={pickRandom}
                                disabled={tabs.length === 0}
                            >
                                Random Topic
                            </Button>
                            <Tooltip title="Sign out" arrow>
                                <IconButton size="small" onClick={clearToken}>
                                    <LogoutIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Stack>

                        {tabs.length === 0 && (
                            <Typography variant="body2" color="text.secondary">
                                No tabs found in the folder.
                            </Typography>
                        )}

                        {pickedTab && (
                            <Tooltip title={`From "${pickedTab.docName}"`} arrow>
                                <Chip
                                    label={pickedTab.title}
                                    component="a"
                                    href={pickedTab.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    clickable
                                    color="primary"
                                    sx={{ fontSize: '1rem', px: 1, py: 2.5 }}
                                />
                            </Tooltip>
                        )}

                        {tabs.length > 0 && (
                            <Box sx={{ width: '100%', mt: 1 }}>
                                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                                    All books ({tabs.length})
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {tabs.map((tab) => (
                                        <Tooltip key={tab.tabId} title={`From "${tab.docName}"`} arrow>
                                            <Chip
                                                label={tab.title}
                                                component="a"
                                                href={tab.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                clickable
                                                variant="outlined"
                                                color="default"
                                            />
                                        </Tooltip>
                                    ))}
                                </Box>
                            </Box>
                        )}
                    </>
                )}
            </Box>
        </>
    );
}
