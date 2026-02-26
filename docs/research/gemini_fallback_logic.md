# Research: Gemini Fallback & Model Integration Logic

## Overview
This document explains the "flawless" generation mechanism implemented in the AI Exam Paper Generator backend. It details how the system handles API rate limits (429 errors) and utilizes various Gemini models to ensure a continuous user experience.

## The Sequential Fallback Chain
The core of the reliability lies in the `FALLBACK_CHAIN` defined in `backend/app/services/generation_service.py`. This mechanism automatically rotates through models if a request fails.

### Model Rotation Sequence
1.  **Attempt 1: `gemini-2.0-flash-lite`**
    *   *Role:* Primary generator.
    *   *Reason:* State-of-the-art speed and excellent JSON structure adherence.
2.  **Attempt 2: `gemini-2.5-flash-lite`**
    *   *Role:* High-priority fallback.
    *   *Reason:* Next-gen "lite" model. If the 2.0 endpoint is saturated or rate-limited, the 2.5 endpoint often has its own separate quota or availability.
3.  **Attempt 3: `gemini-2.0-flash-lite`**
    *   *Role:* Retry.
    *   *Reason:* After a short delay, the transient rate limit on the primary model often clears.
4.  **Attempt 4: `gemini-2.5-flash-lite`**
    *   *Role:* Final attempt.

## Error Handling (The "Flawless" Experience)
When the Google API returns a **429 Too Many Requests** error (common on the free tier, which allows ~15 requests per minute), the backend logic:
1.  **Catches the Exception:** Instead of crashing the request, the error is logged.
2.  **Incremental Backoff:** Waits for 2 seconds (`time.sleep(2)`).
3.  **Model Swap:** Automatically selects the next model in the `FALLBACK_CHAIN`.
4.  **Transparent Execution:** The user on the frontend sees a slight delay but eventually gets their questions without seeing an error message.

## Implementation Details
*   **API Protocol:** Uses Native Google Gemini REST API (v1).
*   **Endpoint:** `https://generativelanguage.googleapis.com/v1/models/`
*   **Authentication:** Direct use of `GOOGLE_API_KEY` from the `.env` file.
*   **Speed:** Direct REST integration (using `requests.post`) avoids the overhead of thick client libraries or middle-man proxies like OpenRouter when configured for "Direct Gemini".

## Capabilities and Potential

The Gemini 2.5 Flash-Lite model is specifically engineered for high-throughput, low-latency, and cost-effective generation. Here is its "full potential" profile:

### 1. Token Capacity
*   **Context Window (Input):** 1,048,576 tokens (~1 million). This allows you to feed entire textbooks, long PDF documents, or massive datasets into a single prompt without losing context.
*   **Output Limit:** Up to 65,536 tokens per request. This is massive for generating long-form content, detailed rubrics, or large sets of questions in one go.

### 2. Speed and Efficiency
*   Optimized for "flash" speeds, meaning it generates text almost as fast as it can be streamed.
*   Highly efficient at following complex structural JSON rules, which is critical for our exam generator.

### 3. Scaling Potential
*   **Free Tier (current):** 15 Requests Per Minute (RPM) and 1,000 Requests Per Day (RPD).
*   **Paid/Tier 1+:** Can scale up to 2,000+ RPM and millions of tokens per minute once billing is enabled, allowing for hundreds of simultaneous users.

## Cost, Quota & Privacy (Free Tier)

As of 2026, using the **Google AI Studio Free Tier** (via the API key in your `.env`) has specific implications:

### 1. Financial Cost: $0
*   **Current Cost:** You are not charged a single cent. Google AI Studio provides this for free to encourage development.
*   **"When will it cost money?":** Only if you manually go to Google Cloud Console, enable "Billing," and switch your API key to a **Pay-as-you-go** plan. As long as you don't do that, the app will simply "stop" generating once you hit the daily limit, rather than charging you.

### 2. Usage Scenario (Burn Rate)
For your specific use case—generating **20 questions by reading a PDF**:
*   **Request Cost:** 1 generation cycle = **1 Request**.
*   **Daily Capacity:** **1,000 cycles per day**. You could generate 20-question sets 1,000 times a day for free.
*   **Minute Capacity:** **15 cycles per minute**. If you try to generate more than 15 sets in 60 seconds, you will see a "429 Rate Limit" error (which is when the fallback logic kicks in).

### 3. Data Privacy
*   **Important:** On the **Free Tier**, Google reserves the right to use submitted data (non-confidential prompts/PDF text) to improve their models.
*   **Production Tip:** If you ever handle highly sensitive or private student data, switching to a **Paid/Tier 1** plan ($) stops Google from using your data for training.

## Current Configuration
As of Feb 2026:
*   **Primary Model:** `gemini-2.0-flash-lite`
*   **Fallback Model:** `gemini-2.5-flash-lite`
*   **Combined Daily Limit:** 1,000 requests per day.
*   **Reliability:** The fallback chain ensures that if you hit the "15 per minute" limit on one model, the system tries to recover using the fallback model or a retry delay.

## Offline & Total Privacy Path

If you want to avoid sharing **any** data with Google or the cloud, you can switch to **Local Mode**.

### 1. Is Gemini Offline?
*   **No.** Gemini (2.0, 2.5, etc.) is a proprietary cloud model. You cannot download it.
*   **Cloud Privacy:** The only way to keep Gemini private is to use a **Paid Tier**, where Google legally agrees not to use your data for training.

### 2. The 100% Offline Alternative: Ollama
Your application is already pre-configured to support local models via **Ollama**.

*   **How it works:** You run the AI on your own graphics card (GPU) or CPU.
*   **Privacy:** 0% data leaves your computer. No internet is required once the model is downloaded.
*   **Recommendation:**
    1.  Download [Ollama](https://ollama.com/) for Windows.
    2.  Run `ollama run llama3.2` or `ollama run phi3` in your terminal.
    3.  In your app, select the **"Local"** engine instead of "Gemini".

### 3. Trade-offs: Quality vs. Privacy
| Feature | Gemini (Cloud) | Llama/Phi (Local/Offline) |
| :--- | :--- | :--- |
| **Privacy** | Shared with Google (Free Tier) | **1,000% Private** |
| **Speed** | Instant | Depends on your PC hardware |
| **Context** | 1 Million Tokens | Usually 8k - 128k Tokens |
| **Cost** | Free (up to 1k/day) | Free (Forever) |

## Final Recommendation
Stay with **Gemini** for its speed and document-handling capacity (the 1-million-token window), but switch to **Ollama + Llama3.2** if you are working with extremely sensitive or confidential exam materials.

## Local Model Performance & Recommendations

If you choose the **Offline/Local Path** using Ollama, here is the performance breakdown:

### 1. `phi3:mini` (3.8B Parameters)
*   **Speed:** Extremely Fast. Typical speeds are **15-50 tokens/sec** on average laptops.
*   **Ideal For:** Fast MCQs and simple factual questions.
*   **Weakness:** Can sometimes "hallucinate" or lose track of long PDF context compared to Llama.

### 2. `llama3.2:3b` (Current Best Recommendation)
*   **Speed:** Very Fast (similar to Phi).
*   **Why it's better:** It is much more "intelligent" at following instructions and mapping Course Outcomes (COs) correctly.
*   **Command:** `ollama run llama3.2`

### 3. `gemma2:9b` (The "Premium" Local Choice)
*   **Speed:** Moderate (**5-15 tokens/sec**).
*   **Why it's better:** Google's own open-source model. It handles complex reasoning and essay questions almost as well as the cloud version.
*   **Requirement:** Requires at least 8GB of VRAM (a dedicated Nvidia GPU) to run smoothly.

### Summary: Which should you use?
*   **For Speed:** stick with `phi3:mini`.
*   **For Accuracy:** upgrade to `llama3.2`.
*   **For the "Full Potential":** use `gemma2:9b` if you have a gaming PC / high-end GPU.

## Full Speed Breakdown (Cloud vs Local)

To give you the **full details** on the speed difference for your 20-question generation task:

### 1. Gemini Cloud (The "Instant" Path)
*   **Time to First Token (TTFT):** ~0.2 seconds. It starts typing almost before you finish clicking.
*   **Throughput (Speed):** ~170 - 220 tokens per second.
*   **20-Question Generation Time:** **~5 to 8 seconds**.
*   **Consistency:** Always the same speed regardless of your computer's power.

### 2. Llama 3.2 3B Local (The "Private" Path)
Your local speed depends entirely on your hardware:

*   **Scenario A: With a Dedicated GPU (Nvidia RTX)**
    *   **Throughput:** ~60 - 80 tokens per second.
    *   **20-Question Generation Time:** **~15 to 25 seconds**.
    *   *Verdict:* Very usable, feels slightly slower but acceptable.

*   **Scenario B: CPU Only (Standard Laptop)**
    *   **Throughput:** ~5 - 12 tokens per second.
    *   **20-Question Generation Time:** **~2 to 4 minutes**.
    *   *Verdict:* Much slower. You will see the questions being typed out line-by-line slowly.

### Detailed Comparison Table
| Metric | Gemini 2.0/2.5 Flash-Lite | Llama 3.2 3B (Local) |
| :--- | :--- | :--- |
| **Response Start** | Instant (<0.5s) | Fast (~1-2s) |
| **Generation Speed** | Blazing Fast (~200 t/s) | Moderate (~10-80 t/s) |
| **Reliability** | Depends on Internet | 100% Reliable (No Internet) |
| **Best For** | Massive PDFs / Quick Tests | Sensitive / Confidential Data |

## Local Efficiency Optimization Guide

To make your offline model perform as close as possible to the cloud speed and quality, follow these advanced optimization steps:

### 1. Hardware Acceleration (The "Rocket Fuel")
If you have a dedicated graphics card (Nvidia/AMD), you can boost speed by **10x - 20x**:
*   **Update Drivers:** Ensure you have the latest Nvidia CUDA drivers.
*   **Enable Flash Attention:** Set the environment variable `OLLAMA_FLASH_ATTENTION=1` in your Windows settings. This drastically reduces memory usage during generation.
*   **VRAM Management:** Ensure your model fits entirely into your GPU's VRAM. For a 3B model like Llama 3.2, you need about 4GB of VRAM.

### 2. Software & Model Tuning
*   **Quantization (Compression):** Use **"4-bit" or "5-bit"** models (e.g., `llama3.2:3b-q4_K_M`). These are much faster than full-size models with almost zero loss in "intelligence." Ollama uses these by default.
*   **Context Length:** In your `Modelfile`, set `num_ctx 8192`. This gives the model enough "memory" for a 20-page PDF without slowing it down by trying to remember too much (the cloud uses 1 million, but you rarely need more than 8k for a single chapter).

### 3. RAG Optimization (Data Intelligence)
Efficiency isn't just about speed; it's about being "smart" with your dataset:
*   **Smart Chunking:** Instead of feeding the whole PDF, the app "chunks" it into small pieces. Keep chunks around **500 - 1000 characters**.
*   **High-Quality Embeddings:** Use a local embedding model like **`nomic-embed-text`**. It's tiny, fast, and very accurate at finding the right section in your PDF.
*   **Reranking:** After the AI finds the relevant parts, use a "reranker" to double-check they are the absolute best matches before answering.

### 4. Checklist for "Cloud-Like" Performance
1.  [ ] **Run Ollama on GPU:** Verify in Task Manager that "GPU 0" usage goes up when you generate.
2.  [ ] **Use Llama 3.2:** It follows the "Question/Answer" format better than Phi-3.
3.  [ ] **Enable Flash Attention:** `SET OLLAMA_FLASH_ATTENTION=1` in your CMD before starting.

---
*Created for future reference on 2026-02-25.*
