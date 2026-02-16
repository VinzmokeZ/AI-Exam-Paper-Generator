import axios from 'axios';

// In production, we use the environment variable VITE_API_URL
// In development, we fallback to the local host
const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:8000/api`;

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export interface Subject {
    id: number;
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
        const response = await api.get('/subjects/');
        return response.data;
    },
    getById: async (id: number | string): Promise<Subject> => {
        const response = await api.get(`/subjects/${id}`);
        return response.data;
    },
    create: async (subject: Omit<Subject, 'id'>): Promise<Subject> => {
        const response = await api.post('/subjects/', subject);
        return response.data;
    },
    update: async (id: number | string, subject: Partial<Subject>): Promise<Subject> => {
        const response = await api.put(`/subjects/${id}`, subject);
        return response.data;
    },
    delete: async (id: number | string): Promise<void> => {
        await api.delete(`/subjects/${id}`);
    }
};

export const topicService = {
    getBySubject: async (subjectId: number | string): Promise<Topic[]> => {
        const response = await api.get(`/subjects/${subjectId}/topics`);
        return response.data;
    },
    create: async (topic: Omit<Topic, 'id' | 'has_syllabus'>): Promise<Topic> => {
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
        const response = await api.get(`/gamification/${userId}`);
        return response.data;
    },
    addXP: async (userId: number, amount: number) => {
        const response = await api.post('/gamification/xp', { user_id: userId, amount });
        return response.data;
    },
    addCoins: async (amount: number, userId: number = 1) => {
        const response = await api.post('/gamification/coins', { user_id: userId, amount });
        return response.data;
    },
    addBadge: async (badge: string, userId: number = 1) => {
        const response = await api.post('/gamification/badge', { user_id: userId, badge });
        return response.data;
    },
    updateProfile: async (userId: number, username: string) => {
        const response = await api.put('/gamification/profile', { user_id: userId, username });
        return response.data;
    }
};

export const generationService = {
    generateQuestions: async (subject: string, topic: string, level: string = "Mixed", count: number = 5, subject_id?: string, rubric?: any, engine?: string) => {
        const selectedEngine = engine || localStorage.getItem('ai_engine_mode') || 'local';
        const response = await api.post('/generate/questions', {
            subject_name: subject,
            topic_name: topic,
            blooms_level: level,
            count: count,
            subject_id: subject_id,
            rubric: rubric,
            engine: selectedEngine
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
        const response = await api.get('/dashboard/stats');
        return response.data;
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

