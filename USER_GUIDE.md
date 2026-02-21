## 0. One-Click Launch (Automation)
I have automated everything for you! 
1. Just run **`REFRESH_AND_RUN.bat`**.
2. It will automatically:
   - Attempt to start **XAMPP** (Apache and MySQL).
   - Start the **AI Engine** (Ollama).
   - Reset and Sync your **MySQL Database** (so you can see it in phpMyAdmin).
   - Launch your **Backend** and **Frontend**.
   - Open your browser to the Dashboard.

## 1. Checking Language Model (LLM)
To verify if the AI is ready to generate questions:
1. Open a terminal in the project folder.
2. Run: `python check_llm.py`
3. You should see `[SUCCESS] Language Model Response: YES`.

## 2. Uploading Folder or PDF for Training
You can train the AI on your own materials:
1. Navigate to **Subject Library** -> Select a Subject.
2. Click the **Upload** icon (top right).
3. Select your **PDF** or **Docx** files.
4. The AI will process these and use them as context for future questions.

## 3. Testing New Features
- **Exam History**: Click the `History` button on the Dashboard. You'll see all previously generated exams here.
- **Leaderboard**: Click the `Leaders` button to see rankings.
- **Gamification**: You now earn **Coins** for every exam generated. Leveling up gives you 50 bonus coins.
- **PDF Export**: In Exam History, click the `PDF` button on any exam to export it.

## 4. Deployment
Ready to go live?
1. Run `DEPLOY_TO_WEB.bat`.
2. This will build your app and help you upload it to Netlify or Firebase.
3. Make sure to point your backend URL in `src/services/api.ts` to your production server address.

## 5. UI Stability
- All modals (like the AI Prompt box) are now constrained to **85% of the screen height**.
- Scrollbars are added where needed to prevent elements from popping out of the phone frame.
- All buttons are wired to their respective routes.
