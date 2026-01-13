import time
import random
import json
import os
import subprocess
import shutil
from playwright.sync_api import sync_playwright

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DASHBOARD_DATA_PATH = os.path.join(SCRIPT_DIR, 'job-dashboard', 'src', 'data', 'jobs.json')
PROCESSED_JOBS_PATH = os.path.join(SCRIPT_DIR, 'processed_jobs.json')
PROCESS_SCRIPT_PATH = os.path.join(SCRIPT_DIR, 'process_jobs.js')


def run_post_processing():
    """Run process_jobs.js and copy output to dashboard."""
    print("\n--- Post-Scrape Processing ---")
    
    if not os.path.exists(PROCESS_SCRIPT_PATH):
        print(f"Warning: {PROCESS_SCRIPT_PATH} not found. Skipping processing.")
        return
    
    print("Running process_jobs.js...")
    try:
        result = subprocess.run(
            ['node', PROCESS_SCRIPT_PATH],
            cwd=SCRIPT_DIR,
            capture_output=True,
            text=True,
            timeout=60
        )
        if result.returncode == 0:
            print(result.stdout)
        else:
            print(f"Error running process_jobs.js: {result.stderr}")
            return
    except subprocess.TimeoutExpired:
        print("Error: process_jobs.js timed out")
        return
    except FileNotFoundError:
        print("Error: Node.js not found. Please ensure node is installed.")
        return
    
    if os.path.exists(PROCESSED_JOBS_PATH):
        os.makedirs(os.path.dirname(DASHBOARD_DATA_PATH), exist_ok=True)
        shutil.copy2(PROCESSED_JOBS_PATH, DASHBOARD_DATA_PATH)
        print(f"Copied processed data to {DASHBOARD_DATA_PATH}")
    else:
        print(f"Warning: {PROCESSED_JOBS_PATH} not found after processing.")

AUTH_FILE = 'ww_session.json'
JOBS_FILE = 'jobs.json'

def scrape_jobs_from_page(page, existing_ids):
    """Extract all job rows from the current page, clicking each for details."""
    jobs = []
    jobs = []
    rows_count = len(page.query_selector_all('tr.table__row--body'))
    
    for i in range(rows_count):
        try:
            row = page.query_selector_all('tr.table__row--body')[i]
            
            checkbox = row.query_selector('input[name="dataViewerSelection"]')
            job_id = checkbox.get_attribute('value') if checkbox else ''
            
            cells = row.query_selector_all('td.table__value')
            title_link = cells[0].query_selector('a')
            
            base_job = {
                'id': job_id,
                'title': cells[0].inner_text().strip() if len(cells) > 0 else '',
                'organization': cells[1].inner_text().strip() if len(cells) > 1 else '',
                'division': cells[2].inner_text().strip() if len(cells) > 2 else '',
                'openings': cells[3].inner_text().strip() if len(cells) > 3 else '',
                'city': cells[4].inner_text().strip() if len(cells) > 4 else '',
                'level': cells[5].inner_text().strip() if len(cells) > 5 else '',
                'apps': cells[6].inner_text().strip() if len(cells) > 6 else '',
                'deadline': cells[7].inner_text().strip() if len(cells) > 7 else '',
            }
            
            if title_link:
                if job_id in existing_ids:
                     print(f"    Skipping job {job_id}: {base_job['title']} (already scraped)")
                else:
                    print(f"    Clicking job {job_id}: {base_job['title']}...")
                    time.sleep(0.5)
                    title_link.click()
                    
                    time.sleep(1.0)
                    try:
                        page.wait_for_selector('h4:has-text("Job Posting Information")', timeout=5000)
                        
                        heading = page.query_selector('h4:has-text("Job Posting Information")')
                        if heading:
                            info_container = heading.evaluate("el => el.parentElement.innerText")
                            base_job['full_description'] = info_container
                        
                        app_info_header = page.query_selector('h4:has-text("Application Information")')
                        if app_info_header:
                            app_info = app_info_header.evaluate("el => el.parentElement.innerText")
                            base_job['application_info'] = app_info
    
                    except:
                        print(f"    Timeout waiting for details modal for job {job_id}")
                        base_job['error'] = 'details_timeout'
    
                    close_btns = page.query_selector_all('button:has(i:text("close"))')
                    clicked_close = False
                    if close_btns:
                        for btn in reversed(close_btns):
                             if btn.is_visible():
                                 btn.click()
                                 clicked_close = True
                                 break
                    
                    if clicked_close:
                        try:
                            page.wait_for_selector('table.data-viewer-table', timeout=5000)
                        except:
                            print("    Warning: Table didn't reappear immediately after closing")
                        time.sleep(1.5)
                    else:
                        print("    Could not find a visible close button") 
            
            jobs.append(base_job)
            
        except Exception as e:
            print(f"Error parsing row {i}: {e}")
            continue
    
    return jobs

def run():
    with sync_playwright() as p:
        try:
            browser = p.chromium.launch(headless=False)
            context = browser.new_context(storage_state=AUTH_FILE)
            print("Loaded previous session")
        except Exception as e:
            print(f"Could not load session from {AUTH_FILE}: {e}")
            print("Starting fresh session due to load failure.")
            browser = p.chromium.launch(headless=False)
            context = browser.new_context()

        page = context.new_page()
        page.goto("https://waterlooworks.uwaterloo.ca/myAccount/co-op/full/jobs.htm")

        try:
            page.wait_for_selector('text=Dashboard', timeout=3000)
            print("Already logged in")
        except:
            print("Please log in manually in the browser window...")
            print("Waiting until you reach the Dashboard.")
            page.wait_for_selector('text=Dashboard', timeout=0)
            print("Login detected, taking control")
            context.storage_state(path=AUTH_FILE)

        print("Waiting for job table to load...")
        page.wait_for_selector('table.data-viewer-table', timeout=30000)
        time.sleep(2)
        
        all_jobs = []
        if os.path.exists(JOBS_FILE):
             try:
                 with open(JOBS_FILE, 'r', encoding='utf-8') as f:
                     all_jobs = json.load(f)
                 print(f"Loaded {len(all_jobs)} existing jobs from {JOBS_FILE}")
             except Exception as e:
                 print(f"Could not load existing jobs: {e}")
        
        existing_ids = set(j['id'] for j in all_jobs if 'id' in j)

        page_num = 1
        consecutive_no_new_pages = 0

        while True:
            print(f"Scraping page {page_num}...")
            new_jobs_on_page = scrape_jobs_from_page(page, existing_ids)
            
            count_new = 0
            for job in new_jobs_on_page:
                if job['id'] not in existing_ids:
                    all_jobs.append(job)
                    existing_ids.add(job['id'])
                    count_new += 1
            
            print(f"  Found {len(new_jobs_on_page)} jobs on this page. Added {count_new} new. (Total: {len(all_jobs)})")

            if count_new == 0:
                consecutive_no_new_pages += 1
                print(f"  No new jobs on this page. ({consecutive_no_new_pages}/3 consecutive empty pages)")
                if consecutive_no_new_pages >= 3:
                     print("  Stopping: No new jobs found for 3 consecutive pages.")
                     break
            else:
                consecutive_no_new_pages = 0

            with open(JOBS_FILE, 'w', encoding='utf-8') as f:
                json.dump(all_jobs, f, indent=2, ensure_ascii=False)

            pagination = page.query_selector('.pagination')
            if not pagination:
                print("No pagination found, single page of results.")
                break
            
            pagination.scroll_into_view_if_needed()
            time.sleep(0.5)
            
            next_btn = page.query_selector('a.pagination__link[aria-label="Go to next page"]')
            
            if next_btn and next_btn.is_visible():
                parent_li = next_btn.evaluate_handle('el => el.closest("li")')
                if parent_li:
                     class_attr = parent_li.get_attribute('class') or ''
                     if 'disabled' in class_attr:
                         print("Next button disabled. No more pages.")
                         break

                try:
                    next_btn.click(force=True)
                except Exception as e:
                    print(f"Error clicking next button: {e}")
                    break
                    
                time.sleep(random.uniform(2, 4))
                page.wait_for_selector('table.data-viewer-table')
                page_num += 1
            else:
                print("No next button found. Stopping.")
                break

        print(f"\nTotal jobs scraped: {len(all_jobs)}")
        
        with open(JOBS_FILE, 'w', encoding='utf-8') as f:
            json.dump(all_jobs, f, indent=2, ensure_ascii=False)
        print(f"Saved to {JOBS_FILE}")

        context.storage_state(path=AUTH_FILE)

        run_post_processing()
        
        print("\nScraping Complete!")
        input("Press Enter to close the browser and exit...")
        browser.close()

if __name__ == "__main__":
    run()