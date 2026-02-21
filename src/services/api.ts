import axios from 'axios';
import { DEFAULT_SUBJECTS } from '../constants/defaultData';

// Detect if running as a Capacitor APK (Robust Check)
const isCapacitorApp = (window as any).Capacitor !== undefined;

// Clear stale discovery cache only if strictly necessary (User requested persistence)
// if (isCapacitorApp) {
//     localStorage.removeItem('active_discovered_url');
// }

const getBaseUrl = () => {
    // 1. Check for manual override from UI
    const customUrl = localStorage.getItem('custom_api_url');
    if (customUrl) return customUrl.endsWith('/api') ? customUrl : `${customUrl}/api`;

    // 2. Identify Environment
    const isNative = isCapacitorApp ||
        (window.location.protocol === 'http:' && window.location.hostname === 'localhost' && !window.location.port);
    const mode = localStorage.getItem('ai_engine_mode') || 'local';
    const hostname = window.location.hostname;

    // 3. SMART DISCOVERY (For APK / Mobile)
    if (isNative || hostname.includes('firebase') || hostname.includes('web.app') || mode === 'cloud') {
        const tunnelUrl = localStorage.getItem('ai_tunnel_url') || 'https://ai-exam-vinz.loca.lt';

        // For Android Studio emulator: 10.0.2.2 ALWAYS maps to host PC localhost
        // This is the correct default — never use tunnel as default for Capacitor
        const emulatorUrl = 'http://10.0.2.2:8000';
        const defaultUrl = isCapacitorApp ? emulatorUrl : tunnelUrl;
        const activeUrl = localStorage.getItem('active_discovered_url') || defaultUrl;

        if (isNative) {
            console.log(`[Smart Discovery] APK connecting to: ${activeUrl}`);
        }

        return `${activeUrl}/api`;
    }

    if (mode === 'local' && (hostname === 'localhost' || hostname === '127.0.0.1')) {
        return `http://${hostname}:8000/api`;
    }

    return `http://${hostname}:8000/api`;
};

const API_URL = getBaseUrl();

export const api = axios.create({
    baseURL: API_URL,
    timeout: 30000, // 30 seconds default (better for physical devices)
    headers: {
        'Content-Type': 'application/json',
        'bypass-tunnel-reminder': 'true'
    },
});

// Helper to use long timeout for AI generation
export const AI_TIMEOUT = 1800000; // 30 mins

// Helper for local profile persistence
const LOCAL_PROFILE_KEY = 'ai_exam_user_profile';
const getLocalProfile = () => {
    const saved = localStorage.getItem(LOCAL_PROFILE_KEY);
    return saved ? JSON.parse(saved) : { username: 'Professor Vinz', level: 1, xp: 0, coins: 0, streak: 0 };
};
const saveLocalProfile = (data: any) => {
    const current = getLocalProfile();
    localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify({ ...current, ...data }));
};

// Helper for local subjects persistence (Flawless Offline)
const LOCAL_SUBJECTS_KEY = 'ai_exam_local_subjects';
const getLocalSubjects = (): Subject[] => {
    const saved = localStorage.getItem(LOCAL_SUBJECTS_KEY);
    const local = saved ? JSON.parse(saved) : [];

    // Merge with defaults to ensure we always have the core subjects
    const localCodes = new Set(local.map((s: any) => s.code.toUpperCase()));
    const missingDefaults = DEFAULT_SUBJECTS.filter(d => !localCodes.has(d.code.toUpperCase()));

    // Map defaults to include local-only fields if needed
    const normalizedDefaults = missingDefaults.map(d => ({ ...d }));

    return [...local, ...normalizedDefaults];
};

const saveLocalSubjects = (subjects: Subject[]) => {
    localStorage.setItem(LOCAL_SUBJECTS_KEY, JSON.stringify(subjects));
};

// Add logging for debugging
api.interceptors.request.use(config => {
    // Inject bypass headers for every request
    config.headers['bypass-tunnel-reminder'] = 'true';
    if (localStorage.getItem('debug_mode') === 'true') {
        console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
});

// Global debug state for UI visualization
export const connectionLogs: string[] = [];
const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    const log = `[${time}] ${msg}`;
    connectionLogs.unshift(log); // Newest first
    if (connectionLogs.length > 50) connectionLogs.pop();
    console.log(log);
};

// DISCOVERY PROBE (For Zero-Config + Roaming)
// Probes all possible backend URLs and locking onto the first one that responds.
// Enhanced: Probes the LAST WORKING URL first for instant "Lock-On".
export const discoverConnectivity = async () => {
    localStorage.setItem('debug_mode', 'true');
    addLog("Starting Discovery Probe...");

    const localhostUrl = 'http://localhost:8000'; // ✅ PRIMARY: works via ADB reverse (USB cable)
    const emulatorHostUrl = 'http://10.0.2.2:8000'; // Android emulator bridge (not physical device)
    const tunnelUrl = localStorage.getItem('ai_tunnel_url') || 'https://ai-exam-vinz.loca.lt';

    // Manual override / last known good IP from localStorage
    const manualUrl = localStorage.getItem('active_discovered_url');
    const lastLocalIp = localStorage.getItem('last_local_ip');

    const targets: string[] = [];

    // 1. LOCALHOST FIRST — works immediately when ADB reverse is active (USB cable)
    targets.push(localhostUrl);

    // 2. Manual override / last known good IP
    if (manualUrl && manualUrl !== localhostUrl) targets.push(manualUrl);
    if (lastLocalIp) targets.push(`http://${lastLocalIp}:8000`);

    // 3. Emulator + Tunnel as last-resort fallbacks
    targets.push(emulatorHostUrl);
    targets.push(tunnelUrl);

    // 4. CLOUD BACKEND (Render) - Add your URL here once deployed
    const cloudUrl = 'https://ai-exam-paper-generator-eyb1.onrender.com';
    targets.push(cloudUrl);

    // Deduplicate while preserving order
    const uniqueTargets = [...new Set(targets)];

    for (const url of uniqueTargets) {
        try {
            addLog(`Probing: ${url}...`);
            const isTunnel = url.includes('loca.lt');
            const testApi = axios.create({
                baseURL: `${url}/api`,
                timeout: isTunnel ? 10000 : 3000 // 3s local (fast), 10s tunnel
            });
            const response = await testApi.get('/health', {
                headers: { 'bypass-tunnel-reminder': 'true' }
            });

            if (response.data) {
                localStorage.setItem('active_discovered_url', url);

                // Cache local Wi-Fi IP for quicker reconnect next time
                const ipMatch = url.match(/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/);
                if (ipMatch && !url.includes('10.0.2.2')) {
                    localStorage.setItem('last_local_ip', ipMatch[0]);
                }

                api.defaults.baseURL = `${url}/api`;
                addLog(`✅ SUCCESS: Locked onto ${url}`);
                console.log(`[API] Backend locked to: ${url}/api`);
                return true;
            }
        } catch (err: any) {
            addLog(`❌ FAILED: ${url}`);
            continue;
        }
    }

    addLog("⚠️ ALL TARGETS FAILED — running in offline mode");
    return false;
};

api.interceptors.response.use(
    response => response,
    error => {
        if (localStorage.getItem('debug_mode') === 'true') {
            console.error(`[API Error] ${error.config?.url}:`, error.message);
        }
        return Promise.reject(error);
    }
);

export interface Subject {
    id: number | string;
    name: string;
    code: string;
    color: string;
    gradient: string;
    introduction: string;
    chapters?: number;
    questions?: number;
}

export interface Topic {
    id: number;
    name: string;
    subject_id: number;
    has_syllabus: boolean;
    question_count?: number;
}

export const subjectService = {
    getAll: async (): Promise<Subject[]> => {
        try {
            const response = await api.get('/subjects/');
            // Sync cloud to local
            const cloudData = response.data;
            saveLocalSubjects(cloudData);
            return cloudData;
        } catch (error) {
            console.warn("Backend subjects offline, using local cache");
            return getLocalSubjects();
        }
    },
    getById: async (id: number | string): Promise<Subject> => {
        try {
            const response = await api.get(`/subjects/${id}`);
            return response.data;
        } catch (error) {
            const local = getLocalSubjects();
            const subject = local.find(s => s.id.toString() === id.toString() || s.code === id);
            if (subject) return subject;
            throw error;
        }
    },
    create: async (subject: Omit<Subject, 'id'>): Promise<Subject> => {
        // Save locally first
        const local = getLocalSubjects();
        const newSubject = { ...subject, id: `local_${Date.now()}` };
        saveLocalSubjects([...local, newSubject]);

        try {
            const response = await api.post('/subjects/', subject);
            return response.data;
        } catch (error) {
            console.warn("Created subject in offline mode");
            return newSubject as Subject;
        }
    },
    update: async (id: number | string, subject: Partial<Subject>): Promise<Subject> => {
        // Update locally first
        const local = getLocalSubjects();
        const updated = local.map(s =>
            (s.id.toString() === id.toString() || s.code === id) ? { ...s, ...subject } : s
        );
        saveLocalSubjects(updated);

        try {
            const response = await api.put(`/subjects/${id}`, subject);
            return response.data;
        } catch (error) {
            console.warn("Updated subject in offline mode");
            return updated.find(s => s.id.toString() === id.toString() || s.code === id) as Subject;
        }
    },
    delete: async (id: number | string): Promise<void> => {
        const local = getLocalSubjects();
        const filtered = local.filter(s => s.id.toString() !== id.toString() && s.code !== id);
        saveLocalSubjects(filtered);

        try {
            await api.delete(`/subjects/${id}`);
        } catch (error) {
            console.warn("Deleted subject in offline mode");
        }
    }
};

export const topicService = {
    getBySubject: async (subjectId: number | string): Promise<Topic[]> => {
        const response = await api.get(`/subjects/${subjectId}/topics`);
        return response.data;
    },
    create: async (topic: { name: string, subject_id: number | string }): Promise<Topic> => {
        const response = await api.post(`/subjects/${topic.subject_id}/topics`, topic);
        return response.data;
    },
    update: async (id: number | string, topic: Partial<Topic>): Promise<Topic> => {
        const response = await api.put(`/topics/${id}`, topic);
        return response.data;
    },
    delete: async (id: number | string): Promise<void> => {
        await api.delete(`/topics/${id}`);
    }
};

export const loggingService = {
    logActivity: async (action: string, details: any = {}) => {
        try {
            await api.post('/logs/', { action, details });
        } catch (error) {
            console.error("Failed to log activity:", error);
        }
    }
};

export const gamificationService = {
    getStats: async (userId: number) => {
        try {
            const response = await api.get(`/gamification/${userId}`);
            saveLocalProfile(response.data); // Keep local in sync
            return response.data;
        } catch (error) {
            console.warn("Backend offline, loading local profile");
            return getLocalProfile(); // Fallback
        }
    },
    addXP: async (userId: number, amount: number) => {
        const response = await api.post('/gamification/xp', { user_id: userId, amount });
        saveLocalProfile(response.data);
        return response.data;
    },
    addCoins: async (amount: number, userId: number = 1) => {
        const response = await api.post('/gamification/coins', { user_id: userId, amount });
        saveLocalProfile(response.data);
        return response.data;
    },
    addBadge: async (badge: string, userId: number = 1) => {
        const response = await api.post('/gamification/badge', { user_id: userId, badge });
        saveLocalProfile(response.data);
        return response.data;
    },
    updateProfile: async (userId: number, username: string) => {
        // 1. Save locally first (Flawless Offline)
        saveLocalProfile({ username });
        try {
            const response = await api.put('/gamification/profile', { user_id: userId, username });
            saveLocalProfile(response.data); // Sync with final server version
            return response.data;
        } catch (error) {
            console.error("Failed to sync profile change to backend - remaining in offline mode");
            return getLocalProfile(); // Return local if backend fails
        }
    }
};

export const generationService = {
    generateQuestions: async (subject: string, topic: string, level: string, count: number = 5, subjectId?: string, rubric?: any, engine: string = "local") => {
        try {
            const payload = {
                subject_name: subject,
                topic_name: topic,
                blooms_level: level,
                count: count,
                subject_id: subjectId,
                rubric: rubric,
                engine: engine
            };

            const response = await api.post('/generate/questions', payload, { timeout: AI_TIMEOUT });
            return response.data;
        } catch (error) {
            console.warn("Generation backend offline, providing related mock data");

            // subject-related mock fallback as requested
            const mockQuestions = [
                {
                    id: Date.now(),
                    type: 'MCQ',
                    question_text: `Which of the following is a characteristic of ${topic || 'the selected topic'}?`,
                    options: ['Option A', 'Option B', 'Option C', 'Option D'],
                    correct_answer: 'Option A',
                    subject_name: subject,
                    explanation: "This is a mock question generated because the backend is offline."
                }
            ];

            // Keywords matching
            const prompt = topic.toLowerCase();
            if (prompt.includes('sorting')) {
                return [
                    {
                        id: Date.now(),
                        type: 'MCQ',
                        question_text: "Which sorting algorithm has a worst-case time complexity of O(n^2)?",
                        options: ["Quick Sort", "Merge Sort", "Bubble Sort", "Heap Sort"],
                        correct_answer: "Bubble Sort",
                        subject_name: subject,
                        explanation: "Bubble Sort compares adjacent elements and swaps them if they are in the wrong order, leading to O(n^2) in worst case."
                    },
                    {
                        id: Date.now() + 1,
                        type: 'MCQ',
                        question_text: "Which sorting algorithm is stable and has O(n log n) complexity?",
                        options: ["Selection Sort", "Merge Sort", "Quick Sort", "Insertion Sort"],
                        correct_answer: "Merge Sort",
                        subject_name: subject,
                        explanation: "Merge Sort uses divide and conquer and maintains the relative order of equal elements."
                    }
                ];
            } else if (prompt.includes('oop') || prompt.includes('object oriented')) {
                return [
                    {
                        id: Date.now(),
                        type: 'MCQ',
                        question_text: "Which OOP concept allows a sub-class to provide a specific implementation of a method already defined in its super-class?",
                        options: ["Encapsulation", "Polymorphism", "Inheritance", "Abstraction"],
                        correct_answer: "Polymorphism",
                        subject_name: subject,
                        explanation: "Method overriding is a form of runtime polymorphism."
                    }
                ];
            } else if (prompt.includes('data structure')) {
                return [
                    {
                        id: Date.now(),
                        type: 'MCQ',
                        question_text: "Which data structure follows the LIFO (Last In First Out) principle?",
                        options: ["Queue", "Stack", "Linked List", "Tree"],
                        correct_answer: "Stack",
                        subject_name: subject,
                        explanation: "Elements are added and removed from the same end in a Stack."
                    }
                ];
            }

            return mockQuestions;
        }
    },
    uploadGenerationFile: async (file: File, count: number = 5, complexity: string = "Balanced", engine: string = "local") => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('count', count.toString());
        formData.append('complexity', complexity);
        formData.append('engine', engine);

        const response = await api.post('/generate/from-file', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    }
};

export const vettingService = {
    getDrafts: async () => {
        const response = await api.get('/questions/vetting');
        return response.data;
    },
    updateStatus: async (qid: number, status: string) => {
        const response = await api.post(`/questions/${qid}/status`, { status });
        return response.data;
    },
    updateQuestion: async (qid: number, updates: any) => {
        const response = await api.put(`/questions/${qid}`, updates);
        return response.data;
    }
};

export const historyService = {
    getHistory: async () => {
        const response = await api.get('/history');
        return response.data;
    },
    saveHistory: async (history: any) => {
        const response = await api.post('/history', history);
        return response.data;
    },
    deleteHistory: async (id: number) => {
        const response = await api.delete(`/history/${id}`);
        return response.data;
    }
};

export const leaderboardService = {
    getGlobal: async () => {
        const response = await api.get('/leaderboard');
        return response.data;
    },
    getLocal: async () => {
        const response = await api.get('/leaderboard/local');
        return response.data;
    }
};

export const trainingService = {
    uploadDocument: async (subjectId: string, file: File, topicId?: string) => {
        const formData = new FormData();
        formData.append('subject_id', subjectId);
        if (topicId) formData.append('topic_id', topicId);
        formData.append('file', file);
        const response = await api.post('/training/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },
    listFiles: async (subjectCode: string) => {
        const response = await api.get(`/training/files/${subjectCode}`);
        return response.data;
    },
    deleteFile: async (subjectCode: string, fileName: string) => {
        const response = await api.delete(`/training/files/${subjectCode}/${fileName}`);
        return response.data;
    }
};

export const dashboardService = {
    getStats: async () => {
        try {
            const response = await api.get('/dashboard/stats');
            saveLocalProfile(response.data); // Keep local in sync
            return response.data;
        } catch (error) {
            console.warn("Dashboard backend offline, fetching local stats");
            return getLocalProfile();
        }
    },
    getActivity: async () => {
        const response = await api.get('/dashboard/activity');
        return response.data;
    },
    getReports: async () => {
        const response = await api.get('/dashboard/reports');
        return response.data;
    }
};

export const notificationService = {
    getAll: async () => {
        const response = await api.get('/notifications/');
        return response.data;
    },
    markRead: async (id: number) => {
        const response = await api.put(`/notifications/${id}/read`);
        return response.data;
    },
    markAllRead: async () => {
        const response = await api.put('/notifications/read-all');
        return response.data;
    }
};

export const achievementService = {
    getAll: async () => {
        const response = await api.get('/achievements/');
        return response.data;
    }
};
