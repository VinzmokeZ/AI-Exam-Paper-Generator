# Frontend-Backend Integration Guide
**AI Exam Oracle - Phase 5 Implementation**

This guide shows you exactly how to connect your existing Figma UI components to the new backend APIs.

---

## 📦 Prerequisites

1. **Backend Services Created:**
   - ✅ `src/services/rubricService.ts` - Rubric API calls
   - ✅ `src/services/courseOutcomeService.ts` - Course outcome API calls

2. **Backend Running:**
   ```bash
   # Ensure MySQL is started in XAMPP
   # Then run:
   cd backend
   python -m uvicorn app.main:app --reload
   ```

---

## 1. Connect CreateRubric Component

### Current State
- Component has UI for creating rubrics
- State variables for question types and learning outcomes
- Saves locally but doesn't call backend

### Integration Steps

#### Step 1.1: Import the Rubric Service
Add to top of `CreateRubric.tsx`:

```typescript
import { rubricService, RubricCreate } from '../services/rubricService';
import { useState, useEffect } from 'react';
```

#### Step 1.2: Add Subject Fetching
Since rubrics need a `subject_id`, add subject loading:

```typescript
const [subjects, setSubjects] = useState<any[]>([]);
const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);

useEffect(() => {
  // Fetch subjects from backend
  fetch('http://localhost:8000/api/subjects')
    .then(res => res.json())
    .then(data => {
      setSubjects(data);
      if (data.length > 0) {
        setSelectedSubjectId(data[0].id);
      }
    });
}, []);
```

#### Step 1.3: Update handleSaveRubric Function

Replace the existing `handleSaveRubric` with:

```typescript
const handleSaveRubric = async () => {
  // Validate LO distribution
  const validation = rubricService.validateLODistribution([
    { learning_outcome: 'LO1', percentage: co1Percent },
    { learning_outcome: 'LO2', percentage: co2Percent },
    { learning_outcome: 'LO3', percentage: co3Percent },
    { learning_outcome: 'LO4', percentage: co4Percent },
    { learning_outcome: 'LO5', percentage: co5Percent },
  ]);

  if (!validation.valid) {
    alert(validation.error);
    return;
  }

  if (!selectedSubjectId) {
    alert('Please select a subject');
    return;
  }

  if (!rubricName.trim()) {
    alert('Please enter a rubric name');
    return;
  }

  try {
    const rubricData: RubricCreate = {
      name: rubricName,
      subject_id: selectedSubjectId,
      exam_type: 'Final', // or let user select
      duration_minutes: duration,
      ai_instructions: '', // Optional AI guidance text
      question_distributions: [
        {
          question_type: 'MCQ',
          count: mcqCount,
          marks_each: mcqMarks
        },
        {
          question_type: 'Short',
          count: shortAnswerCount,
          marks_each: shortAnswerMarks
        },
        {
          question_type: 'Essay',
          count: essayCount,
          marks_each: essayMarks
        }
      ].filter(qd => qd.count > 0), // Only include types with count > 0
      lo_distributions: [
        { learning_outcome: 'LO1', percentage: co1Percent },
        { learning_outcome: 'LO2', percentage: co2Percent },
        { learning_outcome: 'LO3', percentage: co3Percent },
        { learning_outcome: 'LO4', percentage: co4Percent },
        { learning_outcome: 'LO5', percentage: co5Percent },
      ].filter(lo => lo.percentage > 0) // Only include LOs with percentage > 0
    };

    // Save to backend
    const savedRubric = await rubricService.createRubric(rubricData);
    
    console.log('Rubric saved:', savedRubric);
    alert(`Rubric "${savedRubric.name}" saved successfully!`);
    
    // Navigate to generate page
    navigate('/generate');
  } catch (error: any) {
    console.error('Error saving rubric:', error);
    alert(`Failed to save rubric: ${error.message}`);
  }
};
```

#### Step 1.4: Add Subject Selector to UI

**WHERE TO ADD:** Below the "Rubric Name" input (around line 110), add:

```tsx
{/* Subject Selector - ADD BELOW RUBRIC NAME */}
<div className="bg-[#0A1F1F] rounded-2xl p-4 border-2 border-[#0D3D3D] mt-4">
  <label className="text-[10px] font-bold text-[#8B9E9E] uppercase mb-2 block">
    Subject
  </label>
  <select
    value={selectedSubjectId || ''}
    onChange={(e) => setSelectedSubjectId(parseInt(e.target.value))}
    className="w-full bg-[#0D3D3D] rounded-xl px-4 py-3 text-[#F5F1ED] text-sm outline-none font-medium"
  >
    <option value="">Select a subject</option>
    {subjects.map(subject => (
      <option key={subject.id} value={subject.id}>
        {subject.name}
      </option>
    ))}
  </select>
</div>
```

---

## 2. Connect GenerateExam Component

### Current State
- Has "Create Rubric" button that navigates to create rubric page
- Doesn't load or display saved rubrics

### Integration Steps

#### Step 2.1: Import Services
Add to top of `GenerateExam.tsx`:

```typescript
import { rubricService, RubricResponse } from '../services/rubricService';
```

#### Step 2.2: Add Rubric State

```typescript
const [savedRubrics, setSavedRubrics] = useState<RubricResponse[]>([]);
const [selectedRubric, setSelectedRubric] = useState<RubricResponse | null>(null);
const [isGenerating, setIsGenerating] = useState(false);
```

#### Step 2.3: Load Rubrics on Mount

```typescript
useEffect(() => {
  loadRubrics();
}, []);

const loadRubrics = async () => {
  try {
    const rubrics = await rubricService.listRubrics();
    setSavedRubrics(rubrics);
  } catch (error) {
    console.error('Failed to load rubrics:', error);
  }
};
```

#### Step 2.4: Add Rubric Selection Cards

**WHERE TO ADD:** Below the "Create Rubric" button, add a new section:

```tsx
{/* Saved Rubrics Section - ADD BELOW CREATE RUBRIC BUTTON */}
{savedRubrics.length > 0 && (
  <div className="mx-6 mb-6">
    <h3 className="text-sm font-bold text-[#F5F1ED] mb-3">Saved Rubrics</h3>
    <div className="space-y-3">
      {savedRubrics.map(rubric => (
        <motion.div
          key={rubric.id}
          whileHover={{ scale: 1.02 }}
          className={`bg-[#0A1F1F] rounded-2xl p-4 border-2 cursor-pointer ${
            selectedRubric?.id === rubric.id 
              ? 'border-[#8BE9FD]' 
              : 'border-[#0D3D3D]'
          }`}
          onClick={() => setSelectedRubric(rubric)}
        >
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold text-[#F5F1ED]">{rubric.name}</h4>
            <div className="flex gap-2">
              {/* Duplicate Button */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={async (e) => {
                  e.stopPropagation();
                  try {
                    await rubricService.duplicateRubric(rubric.id);
                    loadRubrics(); // Refresh list
                    alert('Rubric duplicated!');
                  } catch (error: any) {
                    alert(`Failed to duplicate: ${error.message}`);
                  }
                }}
                className="px-3 py-1 bg-[#8BE9FD]/20 text-[#8BE9FD] rounded-lg text-xs font-bold"
              >
                Duplicate
              </motion.button>
              {/* Delete Button */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={async (e) => {
                  e.stopPropagation();
                  if (confirm(`Delete "${rubric.name}"?`)) {
                    try {
                      await rubricService.deleteRubric(rubric.id);
                      loadRubrics(); // Refresh list
                      if (selectedRubric?.id === rubric.id) {
                        setSelectedRubric(null);
                      }
                    } catch (error: any) {
                      alert(`Failed to delete: ${error.message}`);
                    }
                  }
                }}
                className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-xs font-bold"
              >
                Delete
              </motion.button>
            </div>
          </div>
          <div className="text-xs text-[#8B9E9E] space-y-1">
            <div>Subject: {rubric.subject_name || 'Unknown'}</div>
            <div>Type: {rubric.exam_type} • Duration: {rubric.duration_minutes}min</div>
            <div>Total Marks: {rubric.total_marks}</div>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
)}
```

#### Step 2.5: Add Generate Button

```tsx
{/* Generate from Rubric Button */}
{selectedRubric && (
  <div className="mx-6 mb-6">
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={async () => {
        setIsGenerating(true);
        try {
          const result = await rubricService.generateFromRubric(selectedRubric.id);
          alert(`Success! Generated ${result.questions_generated} questions`);
          // Navigate to vetting center to review questions
          navigate('/vetting');
        } catch (error: any) {
          alert(`Generation failed: ${error.message}`);
        } finally {
          setIsGenerating(false);
        }
      }}
      disabled={isGenerating}
      className="w-full bg-gradient-to-r from-[#8BE9FD] to-[#C5B3E6] text-[#0A1F1F] font-bold py-4 rounded-2xl"
    >
      {isGenerating ? 'Generating...' : `Generate Exam from "${selectedRubric.name}"`}
    </motion.button>
  </div>
)}
```

---

## 3. Enhance VettingCenter Component

### Current State
- Displays questions for review
- Has approve/reject functionality
- Missing Course Outcome and Bloom level selection

### Integration Steps

#### Step 3.1: Import Course Outcome Service

```typescript
import { courseOutcomeService, CourseOutcome } from '../services/courseOutcomeService';
```

#### Step 3.2: Add Course Outcomes State

```typescript
const [courseOutcomes, setCourseOutcomes] = useState<CourseOutcome[]>([]);

useEffect(() => {
  loadCourseOutcomes();
}, []);

const loadCourseOutcomes = async () => {
  try {
    const outcomes = await courseOutcomeService.listCourseOutcomes();
    setCourseOutcomes(outcomes);
  } catch (error) {
    console.error('Failed to load course outcomes:', error);
  }
};
```

#### Step 3.3: Add CO and Bloom Selectors to Each Question Card

**WHERE TO ADD:** Inside each question card, add:

```tsx
{/* Course Outcome Selector - ADD INSIDE QUESTION CARD */}
<div className="mt-3">
  <label className="text-[10px] font-bold text-[#8B9E9E] uppercase block mb-1">
    Course Outcome
  </label>
  <select
    value={question.course_outcome || 'CO1'}
    onChange={(e) => {
      // Update question's course outcome
      // You'll need to add an update function
      updateQuestionCO(question.id, e.target.value);
    }}
    className="w-full bg-[#0D3D3D] rounded-xl px-3 py-2 text-[#F5F1ED] text-xs"
  >
    {courseOutcomes.map(co => (
      <option key={co.id} value={co.code}>
        {co.code}: {co.label} (Bloom {co.bloom_level})
      </option>
    ))}
  </select>
</div>

{/* Bloom Level Display */}
<div className="mt-2">
  <span className="text-[10px] text-[#8B9E9E] uppercase">Bloom Level:</span>
  <span className="ml-2 text-xs text-[#8BE9FD] font-bold">
    {question.bloom_level || 'Not Set'}
  </span>
</div>
```

---

## 4. Testing Checklist

### Backend Tests
- [ ] Run `SETUP_MYSQL.bat` to migrate database
- [ ] Verify `ai_exam_oracle` database exists in phpMyAdmin
- [ ] Check tables: `rubrics`, `rubric_question_distributions`, `rubric_lo_distributions`
- [ ] Start backend: `cd backend && python -m uvicorn app.main:app --reload`
- [ ] Visit `http://localhost:8000/docs` to see API documentation

### Frontend Tests
- [ ] **Create Rubric Page:**
  - Set LO distribution to total 100%
  - Fill in question counts
  - Click "Save Rubric"
  - Verify success message
  - Check database in phpMyAdmin

- [ ] **Generate Exam Page:**
  - See saved rubrics listed
  - Click a rubric to select it
  - Click "Duplicate" - verify new rubric appears
  - Click "Generate" - verify success
  - Should navigate to vetting center

- [ ] **Vetting Center:**
  - See generated questions
  - Course Outcome dropdown shows CO1, CO2, CO3
  - Bloom level displays correctly
  - Approve questions and verify status changes

---

## 5. Common Issues & Solutions

### Issue 1: CORS Errors
**Solution:** Backend already has CORS enabled. If you still see errors, check that backend is running on `http://localhost:8000`

### Issue 2: LO Distribution Not Totaling 100%
**Solution:** The validation in `rubricService.validateLODistribution()` blocks saves if total ≠ 100%. Adjust sliders so total equals exactly 100%.

### Issue 3: No Subjects in Dropdown
**Solution:** Ensure you have subjects in the database. Run this in backend Python console:
```python
from app.database import SessionLocal
from app.models import Subject

db = SessionLocal()
subject = Subject(code="CSE101", name="Computer Science Fundamentals")
db.add(subject)
db.commit()
```

### Issue 4: Questions Not Generating
**Solution:** 
1. Check Ollama is running: `ollama list`
2. If Ollama not installed, backend will use fallback mode (placeholder questions)
3. Check backend console for error messages

---

## 6. API Endpoints Reference

### Rubrics
- `GET /api/rubrics` - List all rubrics
- `POST /api/rubrics` - Create rubric
- `GET /api/rubrics/{id}` - Get rubric details
- `POST /api/rubrics/{id}/duplicate` - Duplicate rubric
- `DELETE /api/rubrics/{id}` - Delete rubric
- `PUT /api/rubrics/{id}` - Update rubric

### Generation
- `POST /api/generate/rubric/{id}` - Generate exam from rubric

### Course Outcomes
- `GET /api/course-outcomes` - List all COs
- `POST /api/course-outcomes` - Create CO
- `PUT /api/course-outcomes/{id}` - Update CO
- `DELETE /api/course-outcomes/{id}` - Delete CO

---

## 7. Database Schema Quick Reference

### `rubrics` Table
- `id`, `name`, `subject_id`, `exam_type`, `duration_minutes`, `total_marks`, `ai_instructions`

### `rubric_question_distributions` Table
- `id`, `rubric_id`, `question_type` (MCQ/Short/Essay), `count`, `marks_each`

### `rubric_lo_distributions` Table
- `id`, `rubric_id`, `learning_outcome` (LO1-LO5), `percentage`

### `questions` Table (Enhanced)
- NEW: `rubric_id`, `learning_outcome`, `course_outcome`, `bloom_level`
- Changed: `status` now uses 'pending' instead of 'draft'

---

## Next Steps

1. ✅ Complete Task 1: Fixed `generation_service.py` syntax
2. ✅ Complete Task 2: Created frontend services
3. ✅ Complete Task 3: This integration guide

**Now you can:**
1. Apply the code changes from this guide to your components
2. Test the integration end-to-end
3. Verify data in phpMyAdmin
4. Move to implementing textbook upload and local LLM features

**Need Help?**
- Check `IMPLEMENTATION_SUMMARY.md` for backend details
- Review API docs at `http://localhost:8000/docs`
- Test backend with `python backend/test_backend_setup.py`
