# ww-scraper

A Python-based web scraper for WaterlooWorks using Playwright.

## Description

This script automates the process of scraping job listings from WaterlooWorks. It logs in (handling 2FA manually if needed), navigates to the job listing page, and iterates through job rows to extract detailed information including job descriptions and application details.

## Requirements

- Python 3.x
- Playwright

## Installation

1.  Clone the repository or download the files.
2.  Install the required dependencies:
    ```bash
    pip install playwright
    playwright install
    ```

## Usage

1.  Run the scraper:
    ```bash
    python scraper.py
    ```
2.  The script will launch a browser window.
3.  **First Run / Login**: If you are not logged in, the script will wait for you to manually log in to WaterlooWorks in the opened browser window. Once you reach the dashboard, the script will take over.
4.  **Session Saving**: The session cookies are saved to `ww_session.json`, so subsequent runs might not require a manual login.
5.  **Output**: Scraped job data is saved to `jobs.json`.
