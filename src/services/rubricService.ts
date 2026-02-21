import { api } from './api';

export interface QuestionDistribution {
    question_type: 'MCQ' | 'Short' | 'Essay' | 'Case Study';
    count: number;
    marks_each: number;
}

export interface LODistribution {
    learning_outcome: string; // LO1, LO2, LO3, LO4, LO5
    percentage: number;
}

export interface RubricCreate {
    name: string;
    subject_id: number;
    exam_type: 'Final' | 'Midterm' | 'Quiz' | 'Assignment';
    duration_minutes: number;
    ai_instructions?: string;
    question_distributions: QuestionDistribution[];
    lo_distributions: LODistribution[];
}

export interface RubricResponse extends RubricCreate {
    id: number;
    subject_name?: string;
    total_marks: number;
}

class RubricService {
    async createRubric(rubric: RubricCreate): Promise<RubricResponse> {
        const response = await api.post('/rubrics/', rubric);
        return response.data;
    }

    async listRubrics(): Promise<RubricResponse[]> {
        const response = await api.get('/rubrics/');
        return response.data;
    }

    async getRubric(id: number): Promise<RubricResponse> {
        const response = await api.get(`/rubrics/${id}`);
        return response.data;
    }

    async duplicateRubric(id: number): Promise<RubricResponse> {
        const response = await api.post(`/rubrics/${id}/duplicate`);
        return response.data;
    }

    async deleteRubric(id: number): Promise<void> {
        await api.delete(`/rubrics/${id}`);
    }

    async updateRubric(id: number, rubric: RubricCreate): Promise<RubricResponse> {
        const response = await api.put(`/rubrics/${id}`, rubric);
        return response.data;
    }

    async generateFromRubric(rubricId: number): Promise<{
        success: boolean;
        questions_generated: number;
        log: any;
        message?: string;
        error?: string;
        questions?: any[];
        all_questions?: any[];
    }> {
        const engine = localStorage.getItem('ai_engine_mode') || 'local';
        const response = await api.post(`/generate/rubric/${rubricId}?engine=${engine}`);
        if (!response.data.success) {
            throw new Error(response.data.error || 'Generation failed');
        }
        return response.data;
    }

    /**
     * Validate LO distribution totals 100%
     */
    validateLODistribution(distributions: LODistribution[]): { valid: boolean; total: number; error?: string } {
        const total = distributions.reduce((sum, d) => sum + d.percentage, 0);

        if (total !== 100) {
            return {
                valid: false,
                total,
                error: `Learning Outcome distribution must total 100%, currently: ${total}%`
            };
        }

        return { valid: true, total };
    }
}

export const rubricService = new RubricService();
