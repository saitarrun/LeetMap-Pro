#!/usr/bin/env python3
"""
Multi-Source LeetCode Company Questions Aggregator & Real-Time Sync Engine.
Supports both Algorithms (DSA) and SQL/Database interview questions.
"""

import os
import io
import re
import csv
import json
import time
import tarfile
import urllib.request
from typing import Dict, Any, List, Set, Optional

SOURCE_LIQUIDSLR = "liquidslr/leetcode-company-wise-problems"
SOURCE_SNEHASISHROY = "snehasishroy/leetcode-companywise-interview-questions"
LEETCODE_GRAPHQL = "https://leetcode.com/graphql"
GRINDMAP_COMPANIES_URL = "https://grindmap.xevrion.dev/data/companies.json"

WINDOW_DEFINITIONS = [
    {"index": 0, "name": "Last 30 Days", "key": "30_days", "l_file": "1. Thirty Days.csv", "s_file": "thirty-days.csv"},
    {"index": 1, "name": "Last 3 Months", "key": "3_months", "l_file": "2. Three Months.csv", "s_file": "three-months.csv"},
    {"index": 2, "name": "Last 6 Months", "key": "6_months", "l_file": "3. Six Months.csv", "s_file": "six-months.csv"},
    {"index": 3, "name": "6+ Months Ago", "key": "more_than_6_months", "l_file": "4. More Than Six Months.csv", "s_file": "more-than-six-months.csv"},
    {"index": 4, "name": "All Time", "key": "all", "l_file": "5. All.csv", "s_file": "all.csv"},
]

def slugify(text: str) -> str:
    s = text.lower().strip()
    s = re.sub(r'[\s\.\,\/_\-\+]+', '-', s)
    s = re.sub(r'[^a-z0-9\-]', '', s)
    return s.strip('-')

def fetch_commit_sha(repo: str, branch: str = "main") -> str:
    url = f"https://api.github.com/repos/{repo}/commits/{branch}"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "LeetCodeCompanySync/2.0"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode())
            return data.get("sha", "")[:8]
    except Exception as e:
        if branch == "main":
            return fetch_commit_sha(repo, "master")
        return "latest"

def fetch_tarball(repo: str, branch: str = "main") -> Optional[bytes]:
    url = f"https://github.com/{repo}/archive/refs/heads/{branch}.tar.gz"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "LeetCodeCompanySync/2.0"})
        with urllib.request.urlopen(req, timeout=60) as resp:
            return resp.read()
    except Exception as e:
        if branch == "main":
            return fetch_tarball(repo, "master")
        return None

def fetch_leetcode_official_company_tags() -> Dict[str, Dict[str, Any]]:
    query = """
    query getCompanyTagList {
      companyTags {
        name
        slug
        questionCount
      }
    }
    """
    tags_map = {}
    try:
        req = urllib.request.Request(
            LEETCODE_GRAPHQL,
            data=json.dumps({"query": query}).encode("utf-8"),
            headers={"Content-Type": "application/json", "User-Agent": "Mozilla/5.0"}
        )
        with urllib.request.urlopen(req, timeout=12) as resp:
            data = json.loads(resp.read().decode())
            tags = data.get("data", {}).get("companyTags", [])
            for t in tags:
                slug = slugify(t.get("slug") or t.get("name") or "")
                if slug:
                    tags_map[slug] = {
                        "name": t.get("name"),
                        "slug": slug,
                        "questionCount": t.get("questionCount", 0)
                    }
        print(f"🌐 Connected to Official LeetCode GraphQL: {len(tags_map)} live company tags.")
    except Exception as e:
        print(f"Notice: LeetCode public GraphQL ({e})")
    return tags_map

def fetch_curated_domains() -> Dict[str, str]:
    domains = {}
    try:
        req = urllib.request.Request(GRINDMAP_COMPANIES_URL, headers={"User-Agent": "LeetCodeCompanySync/2.0"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode())
            for item in data:
                if item.get("name") and item.get("domain"):
                    domains[item["name"].lower()] = item["domain"]
                    domains[slugify(item["name"])] = item["domain"]
                    if item.get("slug"):
                        domains[item["slug"]] = item["domain"]
    except Exception as e:
        print(f"Notice: Domain mappings ({e})")
    return domains

def extract_slug_from_link(link: str) -> str:
    match = re.search(r'/problems/([^/?#]+)', link)
    if match:
        return match.group(1)
    clean = link.rstrip('/').split('/')[-1]
    return slugify(clean)

def parse_percent_string(val: str) -> float:
    if not val:
        return 0.0
    val = val.replace('%', '').strip()
    try:
        return round(float(val) / 100.0, 4)
    except ValueError:
        return 0.0

def parse_float_safe(val: Any) -> float:
    if not val:
        return 0.0
    try:
        return float(str(val).replace('%', '').strip())
    except ValueError:
        return 0.0

def is_sql_problem(topics: List[str], title: str = "") -> bool:
    lower_topics = [t.lower() for t in topics]
    if any(k in lower_topics for k in ("database", "sql", "mysql", "postgresql")):
        return True
    return False

def parse_liquidslr_tar(tar_bytes: bytes) -> Dict[str, Dict[int, List[Dict[str, Any]]]]:
    data: Dict[str, Dict[int, List[Dict[str, Any]]]] = {}
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
            for win in WINDOW_DEFINITIONS:
                if filename == win["l_file"]:
                    window_idx = win["index"]
                    break
            if window_idx == -1:
                continue
                
            f = tar.extractfile(member)
            if not f:
                continue
                
            text = f.read().decode("utf-8", errors="ignore")
            reader = csv.DictReader(io.StringIO(text))
            problems = []
            for row in reader:
                title = (row.get("Title") or "").strip()
                if not title:
                    continue
                diff = (row.get("Difficulty") or "MEDIUM").strip().upper()
                if diff not in ("EASY", "MEDIUM", "HARD"):
                    diff = "MEDIUM"
                freq = round(parse_float_safe(row.get("Frequency")), 1)
                acc = parse_float_safe(row.get("Acceptance Rate"))
                link = (row.get("Link") or "").strip()
                slug = extract_slug_from_link(link)
                raw_topics = (row.get("Topics") or "").strip()
                topics = [t.strip() for t in raw_topics.split(",") if t.strip()] if raw_topics else []
                
                problems.append({
                    "title": title,
                    "slug": slug,
                    "difficulty": diff,
                    "frequency": freq,
                    "acceptance": acc,
                    "link": link or f"https://leetcode.com/problems/{slug}",
                    "topics": topics,
                    "isSql": is_sql_problem(topics, title),
                    "source": "liquidslr"
                })
                
            comp_slug = slugify(company_name)
            if comp_slug not in data:
                data[comp_slug] = {"name": company_name, "windows": {}}
            data[comp_slug]["windows"][window_idx] = problems
    return data

def parse_snehasishroy_tar(tar_bytes: bytes) -> Dict[str, Dict[int, List[Dict[str, Any]]]]:
    data: Dict[str, Dict[int, List[Dict[str, Any]]]] = {}
    with tarfile.open(fileobj=io.BytesIO(tar_bytes), mode="r:gz") as tar:
        for member in tar.getmembers():
            if not member.name.endswith(".csv"):
                continue
            parts = member.name.split("/")
            if len(parts) < 3:
                continue
            company_folder = parts[1].strip()
            filename = parts[-1].strip()
            
            window_idx = -1
            for win in WINDOW_DEFINITIONS:
                if filename == win["s_file"]:
                    window_idx = win["index"]
                    break
            if window_idx == -1:
                continue
                
            f = tar.extractfile(member)
            if not f:
                continue
                
            text = f.read().decode("utf-8", errors="ignore")
            reader = csv.DictReader(io.StringIO(text))
            problems = []
            for row in reader:
                title = (row.get("Title") or "").strip()
                if not title:
                    continue
                prob_id = (row.get("ID") or "").strip()
                diff = (row.get("Difficulty") or "MEDIUM").strip().upper()
                if diff not in ("EASY", "MEDIUM", "HARD"):
                    diff = "MEDIUM"
                freq = round(parse_float_safe(row.get("Frequency %")), 1)
                acc = parse_percent_string(row.get("Acceptance %") or "")
                link = (row.get("URL") or "").strip()
                slug = extract_slug_from_link(link)
                
                problems.append({
                    "id": prob_id,
                    "title": title,
                    "slug": slug,
                    "difficulty": diff,
                    "frequency": freq,
                    "acceptance": acc,
                    "link": link or f"https://leetcode.com/problems/{slug}",
                    "topics": [],
                    "source": "snehasishroy"
                })
                
            comp_slug = slugify(company_folder)
            comp_name = company_folder.replace('-', ' ').title()
            if comp_slug not in data:
                data[comp_slug] = {"name": comp_name, "windows": {}}
            data[comp_slug]["windows"][window_idx] = problems
    return data

def merge_company_datasets(
    liquidslr_data: Dict[str, Any],
    snehasishroy_data: Dict[str, Any],
    domain_map: Dict[str, str],
    leetcode_tags: Dict[str, Any]
) -> List[Dict[str, Any]]:
    all_slugs = set(liquidslr_data.keys()).union(set(snehasishroy_data.keys()))
    merged_companies = []

    for slug in sorted(all_slugs):
        l_comp = liquidslr_data.get(slug)
        s_comp = snehasishroy_data.get(slug)

        name = (l_comp and l_comp.get("name")) or (s_comp and s_comp.get("name")) or slug.replace('-', ' ').title()
        if slug in leetcode_tags:
            name = leetcode_tags[slug].get("name", name)
            
        domain = domain_map.get(slug) or domain_map.get(name.lower()) or f"{slug}.com"
        
        merged_windows = []
        for win in WINDOW_DEFINITIONS:
            w_idx = win["index"]
            l_probs = l_comp["windows"].get(w_idx, []) if l_comp else []
            s_probs = s_comp["windows"].get(w_idx, []) if s_comp else []

            prob_map: Dict[str, Dict[str, Any]] = {}

            for p in l_probs:
                is_sql = p.get("isSql") or is_sql_problem(p.get("topics", []), p["title"])
                prob_map[p["slug"]] = {
                    "id": "",
                    "title": p["title"],
                    "slug": p["slug"],
                    "difficulty": p["difficulty"],
                    "frequency": p["frequency"],
                    "acceptance": p["acceptance"],
                    "link": p["link"],
                    "topics": p["topics"],
                    "isSql": is_sql,
                    "verifiedSources": ["liquidslr"]
                }

            for p in s_probs:
                if p["slug"] in prob_map:
                    entry = prob_map[p["slug"]]
                    entry["id"] = p.get("id") or entry.get("id", "")
                    if p.get("acceptance", 0) > 0:
                        entry["acceptance"] = p["acceptance"]
                    if p.get("frequency", 0) > entry["frequency"]:
                        entry["frequency"] = p["frequency"]
                    if "snehasishroy" not in entry["verifiedSources"]:
                        entry["verifiedSources"].append("snehasishroy")
                else:
                    is_sql = is_sql_problem([], p["title"])
                    prob_map[p["slug"]] = {
                        "id": p.get("id", ""),
                        "title": p["title"],
                        "slug": p["slug"],
                        "difficulty": p["difficulty"],
                        "frequency": p["frequency"],
                        "acceptance": p["acceptance"],
                        "link": p["link"],
                        "topics": ["Database"] if is_sql else [],
                        "isSql": is_sql,
                        "verifiedSources": ["snehasishroy"]
                    }

            sorted_probs = sorted(prob_map.values(), key=lambda x: x["frequency"], reverse=True)
            win_sql_count = sum(1 for p in sorted_probs if p.get("isSql", False) or "database" in [t.lower() for t in p.get("topics", [])])
            merged_windows.append({
                "name": win["name"],
                "key": win["key"],
                "count": len(sorted_probs),
                "sqlCount": win_sql_count,
                "problems": sorted_probs
            })

        all_time_probs = merged_windows[4]["problems"]
        if not all_time_probs:
            comb: Dict[str, Any] = {}
            for w in merged_windows:
                for p in w["problems"]:
                    comb[p["slug"]] = p
            all_time_probs = sorted(comb.values(), key=lambda x: x["frequency"], reverse=True)
            merged_windows[4]["problems"] = all_time_probs
            merged_windows[4]["count"] = len(all_time_probs)
            merged_windows[4]["sqlCount"] = sum(1 for p in all_time_probs if p.get("isSql", False) or "database" in [t.lower() for t in p.get("topics", [])])

        easy_c = sum(1 for p in all_time_probs if p["difficulty"] == "EASY")
        med_c = sum(1 for p in all_time_probs if p["difficulty"] == "MEDIUM")
        hard_c = sum(1 for p in all_time_probs if p["difficulty"] == "HARD")

        sql_probs = [p for p in all_time_probs if p.get("isSql", False) or "database" in [t.lower() for t in p.get("topics", [])]]
        sql_c = len(sql_probs)
        sql_easy = sum(1 for p in sql_probs if p["difficulty"] == "EASY")
        sql_med = sum(1 for p in sql_probs if p["difficulty"] == "MEDIUM")
        sql_hard = sum(1 for p in sql_probs if p["difficulty"] == "HARD")
        total_c = len(all_time_probs)

        if total_c == 0:
            continue

        merged_companies.append({
            "name": name,
            "slug": slug,
            "domain": domain,
            "total": total_c,
            "easy": easy_c,
            "medium": med_c,
            "hard": hard_c,
            "sqlTotal": sql_c,
            "sqlEasy": sql_easy,
            "sqlMedium": sql_med,
            "sqlHard": sql_hard,
            "windows": merged_windows,
            "windowsCount": {
                "30_days": merged_windows[0]["count"],
                "3_months": merged_windows[1]["count"],
                "6_months": merged_windows[2]["count"],
                "more_than_6_months": merged_windows[3]["count"],
                "all": merged_windows[4]["count"],
            },
            "sqlWindowsCount": {
                "30_days": merged_windows[0].get("sqlCount", 0),
                "3_months": merged_windows[1].get("sqlCount", 0),
                "6_months": merged_windows[2].get("sqlCount", 0),
                "more_than_6_months": merged_windows[3].get("sqlCount", 0),
                "all": merged_windows[4].get("sqlCount", 0),
            }
        })

    merged_companies.sort(key=lambda c: c["total"], reverse=True)
    return merged_companies

def build_global_sql_dataset(merged_companies: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Aggregate all SQL questions across all companies into a unified SQL catalog."""
    sql_catalog: Dict[str, Dict[str, Any]] = {}

    for c in merged_companies:
        c_name = c["name"]
        c_slug = c["slug"]
        for p in c["windows"][4]["problems"]:
            if p.get("isSql") or "database" in [t.lower() for t in p.get("topics", [])]:
                pslug = p["slug"]
                if pslug not in sql_catalog:
                    sql_catalog[pslug] = {
                        "id": p.get("id", ""),
                        "title": p["title"],
                        "slug": pslug,
                        "difficulty": p["difficulty"],
                        "acceptance": p["acceptance"],
                        "link": p["link"],
                        "topics": p.get("topics", ["Database"]),
                        "isSql": True,
                        "maxFrequency": p["frequency"],
                        "companiesCount": 0,
                        "companies": []
                    }
                sql_catalog[pslug]["companies"].append({
                    "name": c_name,
                    "slug": c_slug,
                    "frequency": p["frequency"]
                })
                if p["frequency"] > sql_catalog[pslug]["maxFrequency"]:
                    sql_catalog[pslug]["maxFrequency"] = p["frequency"]

    for item in sql_catalog.values():
        item["companiesCount"] = len(item["companies"])
        # Sort companies asking this question by frequency descending
        item["companies"].sort(key=lambda x: x["frequency"], reverse=True)

    # Sort catalog by companiesCount descending (most popular interview SQL questions first)
    sorted_sql_problems = sorted(
        sql_catalog.values(),
        key=lambda x: (x["companiesCount"], x["maxFrequency"]),
        reverse=True
    )

    return {
        "totalSqlProblems": len(sorted_sql_problems),
        "lastUpdated": int(time.time() * 1000),
        "problems": sorted_sql_problems
    }

def main():
    start_time = time.time()
    print("🚀 Initializing Multi-Source Real-Time Synchronization (DSA + SQL)...")

    sha1 = fetch_commit_sha(SOURCE_LIQUIDSLR, "main")
    sha2 = fetch_commit_sha(SOURCE_SNEHASISHROY, "master")
    print(f"📌 Source 1 [{SOURCE_LIQUIDSLR}]: commit {sha1}")
    print(f"📌 Source 2 [{SOURCE_SNEHASISHROY}]: commit {sha2}")

    leetcode_tags = fetch_leetcode_official_company_tags()
    domain_map = fetch_curated_domains()

    print(f"📦 Downloading Source 1 [{SOURCE_LIQUIDSLR}]...")
    l_bytes = fetch_tarball(SOURCE_LIQUIDSLR, "main")
    liquidslr_data = parse_liquidslr_tar(l_bytes) if l_bytes else {}

    print(f"📦 Downloading Source 2 [{SOURCE_SNEHASISHROY}]...")
    s_bytes = fetch_tarball(SOURCE_SNEHASISHROY, "master")
    snehasishroy_data = parse_snehasishroy_tar(s_bytes) if s_bytes else {}

    print("🔄 Merging datasets and calculating DSA + SQL distributions...")
    merged_companies = merge_company_datasets(
        liquidslr_data, snehasishroy_data, domain_map, leetcode_tags
    )

    # Build dedicated SQL dataset
    print("🗄️  Extracting and compiling dedicated SQL / Database questions catalog...")
    sql_dataset = build_global_sql_dataset(merged_companies)
    print(f"   Found {sql_dataset['totalSqlProblems']} distinct SQL interview questions.")

    total_unique_slugs = set()
    for c in merged_companies:
        for w in c["windows"]:
            for p in w["problems"]:
                total_unique_slugs.add(p["slug"])

    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    public_data_dir = os.path.join(base_dir, "public", "data")
    companies_dir = os.path.join(public_data_dir, "companies")
    os.makedirs(companies_dir, exist_ok=True)

    # Save individual companies
    for c in merged_companies:
        company_path = os.path.join(companies_dir, f"{c['slug']}.json")
        with open(company_path, "w", encoding="utf-8") as f:
            json.dump(c, f, separators=(',', ':'))

    # Save lightweight companies.json index
    index_list = []
    sql_companies_list = []
    for c in merged_companies:
        item = {
            "name": c["name"],
            "slug": c["slug"],
            "domain": c["domain"],
            "total": c["total"],
            "easy": c["easy"],
            "medium": c["medium"],
            "hard": c["hard"],
            "sqlTotal": c.get("sqlTotal", 0),
            "sqlEasy": c.get("sqlEasy", 0),
            "sqlMedium": c.get("sqlMedium", 0),
            "sqlHard": c.get("sqlHard", 0),
            "windowsCount": c["windowsCount"],
            "sqlWindowsCount": c.get("sqlWindowsCount", {})
        }
        index_list.append(item)
        if c.get("sqlTotal", 0) > 0:
            sql_companies_list.append(item)

    index_path = os.path.join(public_data_dir, "companies.json")
    with open(index_path, "w", encoding="utf-8") as f:
        json.dump(index_list, f, separators=(',', ':'))

    # Save dedicated sql-companies.json
    sql_companies_list.sort(key=lambda x: x["sqlTotal"], reverse=True)
    sql_companies_path = os.path.join(public_data_dir, "sql-companies.json")
    with open(sql_companies_path, "w", encoding="utf-8") as f:
        json.dump(sql_companies_list, f, separators=(',', ':'))

    # Save dedicated sql-problems.json
    sql_path = os.path.join(public_data_dir, "sql-problems.json")
    with open(sql_path, "w", encoding="utf-8") as f:
        json.dump(sql_dataset, f, separators=(',', ':'))

    # Compile patterns catalog
    try:
        patterns_script = os.path.join(os.path.dirname(__file__), "generate-patterns.py")
        if os.path.exists(patterns_script):
            import subprocess
            subprocess.run(["python3", patterns_script], check=True)
    except Exception as e:
        print(f"⚠️ Failed to auto-compile patterns: {e}")

    duration = round(time.time() - start_time, 2)

    status_obj = {
        "status": "success",
        "lastSynced": int(time.time() * 1000),
        "lastSyncedISO": time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
        "commitSha": f"{sha1}+{sha2}",
        "sources": [
            {"name": SOURCE_LIQUIDSLR, "commit": sha1, "companies": len(liquidslr_data)},
            {"name": SOURCE_SNEHASISHROY, "commit": sha2, "companies": len(snehasishroy_data)},
            {"name": "LeetCode GraphQL", "tagsCount": len(leetcode_tags)}
        ],
        "companiesCount": len(merged_companies),
        "uniqueProblemsCount": len(total_unique_slugs),
        "sqlProblemsCount": sql_dataset["totalSqlProblems"],
        "durationSeconds": duration
    }

    status_path = os.path.join(public_data_dir, "sync-status.json")
    with open(status_path, "w", encoding="utf-8") as f:
        json.dump(status_obj, f, indent=2)

    print(f"\n✅ Multi-Source Sync completed in {duration}s!")
    print(f"📊 Total Companies: {len(merged_companies)}")
    print(f"🧩 Unique Problems: {len(total_unique_slugs)}")
    print(f"🗄️  SQL Problems: {sql_dataset['totalSqlProblems']}")

if __name__ == "__main__":
    main()
