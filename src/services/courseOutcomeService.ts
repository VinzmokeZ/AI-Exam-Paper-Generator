/**
 * Course Outcomes API Service
 * Handles all course outcome-related API calls for vetting workflow
 */

import { api } from './api';

const API_BASE_URL = `http://${window.location.hostname}:8000`;

export interface CourseOutcome {
    id?: number;
    code: string; // CO1, CO2, CO3
    label: string;
    bloom_level: number; // 1-6
    description?: string;
}

class CourseOutcomeService {
    async listCourseOutcomes(): Promise<CourseOutcome[]> {
        const response = await api.get('/course-outcomes');
        return response.data;
    }

    async createCourseOutcome(outcome: Omit<CourseOutcome, 'id'>): Promise<CourseOutcome> {
        const response = await api.post('/course-outcomes', outcome);
        return response.data;
    }

    async updateCourseOutcome(id: number, outcome: Omit<CourseOutcome, 'id'>): Promise<CourseOutcome> {
        const response = await api.put(`/course-outcomes/${id}`, outcome);
        return response.data;
    }

    async deleteCourseOutcome(id: number): Promise<void> {
        await api.delete(`/course-outcomes/${id}`);
    }

    getBloomLevelName(level: number): string {
        const levels: { [key: number]: string } = {
            1: 'Remember',
            2: 'Understand',
            3: 'Apply',
            4: 'Analyze',
            5: 'Evaluate',
            6: 'Create'
        };
        return levels[level] || 'Unknown';
    }
}

export const courseOutcomeService = new CourseOutcomeService();
