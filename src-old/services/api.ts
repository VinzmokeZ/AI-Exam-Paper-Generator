import axios from 'axios';

const API_URL = `http://${window.location.hostname}:8000/api`;

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
}

export interface Topic {
    id: number;
    name: string;
    subject_id: number;
    has_syllabus: boolean;
}

export const subjectService = {
    getAll: async (): Promise<Subject[]> => {
        const response = await api.get('/subjects/');
        return response.data;
    },
    getById: async (id: number): Promise<Subject> => {
        const response = await api.get(`/subjects/${id}`);
        return response.data;
    },
    create: async (subject: Omit<Subject, 'id'>): Promise<Subject> => {
        const response = await api.post('/subjects/', subject);
        return response.data;
    }
};

export const topicService = {
    getBySubject: async (subjectId: number): Promise<Topic[]> => {
        const response = await api.get(`/subjects/${subjectId}/topics`);
        return response.data;
    },
    create: async (topic: Omit<Topic, 'id' | 'has_syllabus'>): Promise<Topic> => {
        const response = await api.post(`/subjects/${topic.subject_id}/topics`, topic);
        return response.data;
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
    getStats: async (userId: number = 1) => { // Mock user ID 1
        const response = await api.get(`/gamification/${userId}`);
        return response.data;
    },
    addXP: async (amount: number, userId: number = 1) => {
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
    }
};

export const generationService = {
    generateQuestions: async (subject: string, topic: string, level: string = "Mixed", count: number = 5, subject_id?: string) => {
        const response = await api.post('/generate/questions', {
            subject_name: subject,
            topic_name: topic,
            blooms_level: level,
            count: count,
            subject_id: subject_id
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
    uploadDocument: async (file: File, subjectId: number) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('subject_id', subjectId.toString());

        const response = await api.post('/training/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    }
};
