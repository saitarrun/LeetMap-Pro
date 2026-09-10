#!/usr/bin/env python3
import os
import io
import re
import csv
import json
import time
import tarfile
import urllib.request
from typing import Dict, Any, List, Set

UPSTREAM_REPO = "liquidslr/leetcode-company-wise-problems"
TARBALL_URL = f"https://github.com/{UPSTREAM_REPO}/archive/refs/heads/main.tar.gz"
COMMIT_API_URL = f"https://api.github.com/repos/{UPSTREAM_REPO}/commits/main"
GRINDMAP_COMPANIES_URL = "https://grindmap.xevrion.dev/data/companies.json"

WINDOW_NAMES = [
    ("1. Thirty Days.csv", "Last 30 Days", "30_days"),
    ("2. Three Months.csv", "Last 3 Months", "3_months"),
    ("3. Six Months.csv", "Last 6 Months", "6_months"),
    ("4. More Than Six Months.csv", "6+ Months Ago", "more_than_6_months"),
    ("5. All.csv", "All Time", "all"),
]

def slugify(text: str) -> str:
    s = text.lower().strip()
    s = re.sub(r'[\s\.\,\/_\-\+]+', '-', s)
    s = re.sub(r'[^a-z0-9\-]', '', s)
    return s.strip('-')

def fetch_upstream_commit_sha() -> str:
    try:
        req = urllib.request.Request(COMMIT_API_URL, headers={"User-Agent": "LeetCodeCompanySync/1.0"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode())
            return data.get("sha", "")[:8]
    except Exception as e:
        print(f"Warning: Could not fetch commit SHA ({e})")
        return "main"

def fetch_domain_mappings() -> Dict[str, str]:
    domains = {}
    try:
        req = urllib.request.Request(GRINDMAP_COMPANIES_URL, headers={"User-Agent": "LeetCodeCompanySync/1.0"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode())
            for item in data:
                if item.get("name") and item.get("domain"):
                    domains[item["name"].lower()] = item["domain"]
                    domains[slugify(item["name"])] = item["domain"]
                    if item.get("slug"):
                        domains[item["slug"]] = item["domain"]
    except Exception as e:
        print(f"Warning: Could not fetch domain mappings from GrindMap: {e}")
    return domains

def extract_slug_from_link(link: str) -> str:
    match = re.search(r'/problems/([^/?#]+)', link)
    if match:
        return match.group(1)
    return slugify(link.split('/')[-1])

def parse_csv_content(csv_bytes: bytes) -> List[Dict[str, Any]]:
    problems = []
    text = csv_bytes.decode('utf-8', errors='ignore')
    reader = csv.DictReader(io.StringIO(text))
    
    for row in reader:
        title = (row.get("Title") or "").strip()
        if not title:
            continue
            
        diff = (row.get("Difficulty") or "MEDIUM").strip().upper()
        if diff not in ("EASY", "MEDIUM", "HARD"):
            diff = "MEDIUM"
            
        try:
            freq = round(float(row.get("Frequency") or 0), 1)
        except ValueError:
            freq = 0.0
            
        try:
            acceptance = float(row.get("Acceptance Rate") or 0)
        except ValueError:
            acceptance = 0.0
            
        link = (row.get("Link") or "").strip()
        slug = extract_slug_from_link(link)
        
        raw_topics = (row.get("Topics") or "").strip()
        topics = [t.strip() for t in raw_topics.split(",") if t.strip()] if raw_topics else []
        
        problems.append({
            "title": title,
            "slug": slug,
            "difficulty": diff,
            "frequency": freq,
            "acceptance": acceptance,
            "link": link,
            "topics": topics
        })
        
    return problems

def main():
    start_time = time.time()
    print(f"🚀 Starting sync from upstream {UPSTREAM_REPO}...")
    
    commit_sha = fetch_upstream_commit_sha()
    print(f"📌 Upstream commit: {commit_sha}")
    
    print("🌐 Fetching curated company domains...")
    domain_map = fetch_domain_mappings()
    print(f"   Found {len(domain_map)} domain mappings.")
    
    print("📦 Downloading repository tarball...")
    req = urllib.request.Request(TARBALL_URL, headers={"User-Agent": "LeetCodeCompanySync/1.0"})
    with urllib.request.urlopen(req, timeout=60) as resp:
        tar_bytes = resp.read()
    print(f"   Downloaded {len(tar_bytes):,} bytes ({len(tar_bytes)/1024/1024:.2f} MB).")
    
    print("⚙️  Parsing CSV files across all companies...")
    companies_data: Dict[str, Dict[int, List[Dict[str, Any]]]] = {}
    
    with tarfile.open(fileobj=io.BytesIO(tar_bytes), mode="r:gz") as tar:
        for member in tar.getmembers():
            if not member.name.endswith(".csv"):
                continue
                
            parts = member.name.split("/")
            if len(parts) < 3:
                continue
                
            company_name = parts[1].strip()
            filename = parts[-1].strip()
            
            window_idx = -1
            for idx, (fname, _, _) in enumerate(WINDOW_NAMES):
                if filename == fname:
                    window_idx = idx
                    break
                    
            if window_idx == -1:
                continue
                
            f = tar.extractfile(member)
            if f is None:
                continue
                
            problems = parse_csv_content(f.read())
            
            if company_name not in companies_data:
                companies_data[company_name] = {}
            companies_data[company_name][window_idx] = problems
            
    print(f"   Extracted data for {len(companies_data)} companies.")
    
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    public_data_dir = os.path.join(base_dir, "public", "data")
    companies_dir = os.path.join(public_data_dir, "companies")
    os.makedirs(companies_dir, exist_ok=True)
    
    company_index_list = []
    total_distinct_problems: Set[str] = set()
    
    for company_name, windows_dict in sorted(companies_data.items(), key=lambda x: x[0].lower()):
        slug = slugify(company_name)
        domain = domain_map.get(slug) or domain_map.get(company_name.lower()) or f"{slug}.com"
        
        windows_out = []
        for idx, (_, win_name, win_key) in enumerate(WINDOW_NAMES):
            plist = windows_dict.get(idx, [])
            windows_out.append({
                "name": win_name,
                "key": win_key,
                "count": len(plist),
                "problems": plist
            })
            for p in plist:
                total_distinct_problems.add(p["slug"])
                
        all_time_problems = windows_dict.get(4, [])
        if not all_time_problems:
            combined = {}
            for plist in windows_dict.values():
                for p in plist:
                    combined[p["slug"]] = p
            all_time_problems = list(combined.values())
            
        easy_count = sum(1 for p in all_time_problems if p["difficulty"] == "EASY")
        med_count = sum(1 for p in all_time_problems if p["difficulty"] == "MEDIUM")
        hard_count = sum(1 for p in all_time_problems if p["difficulty"] == "HARD")
        total_count = len(all_time_problems)
        
        company_obj = {
            "name": company_name,
            "slug": slug,
            "domain": domain,
            "total": total_count,
            "easy": easy_count,
            "medium": med_count,
            "hard": hard_count,
            "windows": windows_out
        }
        
        company_file_path = os.path.join(companies_dir, f"{slug}.json")
        with open(company_file_path, "w", encoding="utf-8") as f:
            json.dump(company_obj, f, separators=(',', ':'))
            
        company_index_list.append({
            "name": company_name,
            "slug": slug,
            "domain": domain,
            "total": total_count,
            "easy": easy_count,
            "medium": med_count,
            "hard": hard_count,
            "windowsCount": {
                "30_days": len(windows_dict.get(0, [])),
                "3_months": len(windows_dict.get(1, [])),
                "6_months": len(windows_dict.get(2, [])),
                "more_than_6_months": len(windows_dict.get(3, [])),
                "all": len(windows_dict.get(4, []))
            }
        })
        
    company_index_list.sort(key=lambda c: c["total"], reverse=True)
    
    index_file_path = os.path.join(public_data_dir, "companies.json")
    with open(index_file_path, "w", encoding="utf-8") as f:
        json.dump(company_index_list, f, separators=(',', ':'))
        
    duration = round(time.time() - start_time, 2)
    
    status_obj = {
        "status": "success",
        "lastSynced": int(time.time() * 1000),
        "lastSyncedISO": time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
        "commitSha": commit_sha,
        "companiesCount": len(company_index_list),
        "uniqueProblemsCount": len(total_distinct_problems),
        "durationSeconds": duration,
        "upstreamRepo": UPSTREAM_REPO
    }
    status_file_path = os.path.join(public_data_dir, "sync-status.json")
    with open(status_file_path, "w", encoding="utf-8") as f:
        json.dump(status_obj, f, indent=2)
        
    print(f"\n✅ Sync completed successfully in {duration}s!")
    print(f"📊 Total Companies: {len(company_index_list)}")
    print(f"🧩 Unique Problems: {len(total_distinct_problems)}")
    print(f"📁 Output files written to {public_data_dir}")

if __name__ == "__main__":
    main()
