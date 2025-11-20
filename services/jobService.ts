import { API_CONFIG, STORAGE_KEYS } from '../utils/constants';
import { logger } from '../utils/logger';

// Job status types
export type JobStatus = 'queued' | 'active' | 'completed' | 'failed';

export interface JobStatusResponse {
    jobId: string;
    status: JobStatus;
    progress?: number;
    result?: any;
    error?: string;
    createdAt?: number;
    finishedAt?: number;
}

// Helper to get the JWT token
const getAuthToken = () => {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) || '';
};

// Submit analysis job (returns job ID immediately)
export async function submitAnalysisJob(payload: {
    ventureId: string;
    module: string;
    tool: string;
    description: string;
    language?: string;
    prompt: string;
    responseSchema: any;
    images?: string[];
    refinementInstruction?: string;
    parentAnalysisId?: string;
}): Promise<{ jobId: string; status: string }> {
    const token = getAuthToken();

    const response = await fetch(`${API_CONFIG.BACKEND_URL}/analysis/generate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        if (response.status === 401) throw new Error('Authentication Required. Please sign in.');
        if (response.status === 429) throw new Error('Rate limit exceeded. Please try again later.');
        throw new Error('Failed to submit analysis job');
    }

    return await response.json();
}

// Poll job status
export async function getJobStatus(jobId: string): Promise<JobStatusResponse> {
    const token = getAuthToken();

    const response = await fetch(`${API_CONFIG.BACKEND_URL}/jobs/${jobId}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error('Failed to fetch job status');
    }

    return await response.json();
}

// Poll until completion (with timeout)
export async function waitForJobCompletion<T>(
    jobId: string,
    pollInterval = 2000,
    timeout = 300000 // 5 minutes
): Promise<T> {
    const startTime = Date.now();

    return new Promise((resolve, reject) => {
        const poll = async () => {
            try {
                const status = await getJobStatus(jobId);

                if (status.status === 'completed') {
                    clearInterval(intervalId);
                    resolve(status.result as T);
                } else if (status.status === 'failed') {
                    clearInterval(intervalId);
                    reject(new Error(status.error || 'Job failed'));
                } else if (Date.now() - startTime > timeout) {
                    clearInterval(intervalId);
                    reject(new Error('Job timeout'));
                }
            } catch (error) {
                clearInterval(intervalId);
                reject(error);
            }
        };

        const intervalId = setInterval(poll, pollInterval);
        poll(); // Initial poll
    });
}
