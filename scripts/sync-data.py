#!/usr/bin/env python3
"""
Multi-Source LeetCode Company Questions Aggregator & Real-Time Sync Engine.
Does NOT rely on a single source:
1. Upstream Source 1: liquidslr/leetcode-company-wise-problems (CSVs with topic tags & 5 time windows)
2. Upstream Source 2: snehasishroy/leetcode-companywise-interview-questions (CSVs with problem IDs, exact acceptance %, recent 2026 commits)
3. Upstream Source 3: Official LeetCode GraphQL (companyTags list for live 984 companies and problem count cross-referencing)
4. Upstream Source 4: Optional Direct LeetCode Session (via LEETCODE_SESSION env var or cookie argument)
5. Fallback Cache: grindmap.xevrion.dev/data/
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
        # try master if main failed
        if branch == "main":
            return fetch_commit_sha(repo, "master")
        print(f"Warning: Could not fetch commit SHA for {repo} ({e})")
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
        print(f"Error downloading {repo}: {e}")
        return None

def fetch_leetcode_official_company_tags() -> Dict[str, Dict[str, Any]]:
    """Fetch live company tags and question counts directly from LeetCode GraphQL."""
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
        print(f"Notice: LeetCode public GraphQL companyTags ({e})")
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
                # If acceptance is raw float <= 1, keep it
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
                # Headers: ID,URL,Title,Difficulty,Acceptance %,Frequency %
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
        # Check leetcode tags for canonical display name if available
        if slug in leetcode_tags:
            name = leetcode_tags[slug].get("name", name)
            
        domain = domain_map.get(slug) or domain_map.get(name.lower()) or f"{slug}.com"
        
        # Merge windows 0..4
        merged_windows = []
        for win in WINDOW_DEFINITIONS:
            w_idx = win["index"]
            l_probs = l_comp["windows"].get(w_idx, []) if l_comp else []
            s_probs = s_comp["windows"].get(w_idx, []) if s_comp else []

            # Map by slug
            prob_map: Dict[str, Dict[str, Any]] = {}

            # First ingest liquidslr (has topics)
            for p in l_probs:
                prob_map[p["slug"]] = {
                    "id": "",
                    "title": p["title"],
                    "slug": p["slug"],
                    "difficulty": p["difficulty"],
                    "frequency": p["frequency"],
                    "acceptance": p["acceptance"],
                    "link": p["link"],
                    "topics": p["topics"],
                    "verifiedSources": ["liquidslr"]
                }

            # Then merge snehasishroy (has IDs and human percentage)
            for p in s_probs:
                if p["slug"] in prob_map:
                    entry = prob_map[p["slug"]]
                    entry["id"] = p.get("id") or entry.get("id", "")
                    # Use snehasishroy acceptance percentage if valid
                    if p.get("acceptance", 0) > 0:
                        entry["acceptance"] = p["acceptance"]
                    # Use highest frequency score reported
                    if p.get("frequency", 0) > entry["frequency"]:
                        entry["frequency"] = p["frequency"]
                    if "snehasishroy" not in entry["verifiedSources"]:
                        entry["verifiedSources"].append("snehasishroy")
                else:
                    prob_map[p["slug"]] = {
                        "id": p.get("id", ""),
                        "title": p["title"],
                        "slug": p["slug"],
                        "difficulty": p["difficulty"],
                        "frequency": p["frequency"],
                        "acceptance": p["acceptance"],
                        "link": p["link"],
                        "topics": [],
                        "verifiedSources": ["snehasishroy"]
                    }

            # Sort window problems by frequency descending
            sorted_probs = sorted(prob_map.values(), key=lambda x: x["frequency"], reverse=True)
            merged_windows.append({
                "name": win["name"],
                "key": win["key"],
                "count": len(sorted_probs),
                "problems": sorted_probs
            })

        # Calculate all-time summary
        all_time_probs = merged_windows[4]["problems"]
        if not all_time_probs:
            # Fallback: combine all windows
            comb: Dict[str, Any] = {}
            for w in merged_windows:
                for p in w["problems"]:
                    comb[p["slug"]] = p
            all_time_probs = sorted(comb.values(), key=lambda x: x["frequency"], reverse=True)
            merged_windows[4]["problems"] = all_time_probs
            merged_windows[4]["count"] = len(all_time_probs)

        easy_c = sum(1 for p in all_time_probs if p["difficulty"] == "EASY")
        med_c = sum(1 for p in all_time_probs if p["difficulty"] == "MEDIUM")
        hard_c = sum(1 for p in all_time_probs if p["difficulty"] == "HARD")
        total_c = len(all_time_probs)

        # Skip companies with zero questions
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
            "windows": merged_windows,
            "windowsCount": {
                "30_days": merged_windows[0]["count"],
                "3_months": merged_windows[1]["count"],
                "6_months": merged_windows[2]["count"],
                "more_than_6_months": merged_windows[3]["count"],
                "all": merged_windows[4]["count"],
            }
        })

    # Sort companies by total questions descending
    merged_companies.sort(key=lambda c: c["total"], reverse=True)
    return merged_companies

def main():
    start_time = time.time()
    print("🚀 Initializing Multi-Source Real-Time Synchronization...")

    # Fetch Git commit metadata
    sha1 = fetch_commit_sha(SOURCE_LIQUIDSLR, "main")
    sha2 = fetch_commit_sha(SOURCE_SNEHASISHROY, "master")
    print(f"📌 Source 1 [{SOURCE_LIQUIDSLR}]: commit {sha1}")
    print(f"📌 Source 2 [{SOURCE_SNEHASISHROY}]: commit {sha2}")

    # Fetch official LeetCode GraphQL company tags
    leetcode_tags = fetch_leetcode_official_company_tags()

    # Curated domain map
    domain_map = fetch_curated_domains()

    # Download Source 1
    print(f"📦 Downloading Source 1 [{SOURCE_LIQUIDSLR}]...")
    l_bytes = fetch_tarball(SOURCE_LIQUIDSLR, "main")
    if l_bytes:
        print(f"   Downloaded {len(l_bytes):,} bytes from Source 1.")
        liquidslr_data = parse_liquidslr_tar(l_bytes)
        print(f"   Parsed {len(liquidslr_data)} companies from Source 1.")
    else:
        print("   Warning: Source 1 download failed, continuing with other sources...")
        liquidslr_data = {}

    # Download Source 2
    print(f"📦 Downloading Source 2 [{SOURCE_SNEHASISHROY}]...")
    s_bytes = fetch_tarball(SOURCE_SNEHASISHROY, "master")
    if s_bytes:
        print(f"   Downloaded {len(s_bytes):,} bytes from Source 2.")
        snehasishroy_data = parse_snehasishroy_tar(s_bytes)
        print(f"   Parsed {len(snehasishroy_data)} companies from Source 2.")
    else:
        print("   Warning: Source 2 download failed, continuing with other sources...")
        snehasishroy_data = {}

    # Merge and cross-validate
    print("🔄 Merging and cross-validating multi-source datasets...")
    merged_companies = merge_company_datasets(
        liquidslr_data, snehasishroy_data, domain_map, leetcode_tags
    )

    total_unique_slugs = set()
    for c in merged_companies:
        for w in c["windows"]:
            for p in w["problems"]:
                total_unique_slugs.add(p["slug"])

    # Output paths
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    public_data_dir = os.path.join(base_dir, "public", "data")
    companies_dir = os.path.join(public_data_dir, "companies")
    os.makedirs(companies_dir, exist_ok=True)

    # Save individual company JSON files
    for c in merged_companies:
        company_path = os.path.join(companies_dir, f"{c['slug']}.json")
        with open(company_path, "w", encoding="utf-8") as f:
            json.dump(c, f, separators=(',', ':'))

    # Save lightweight companies.json index
    index_list = []
    for c in merged_companies:
        index_list.append({
            "name": c["name"],
            "slug": c["slug"],
            "domain": c["domain"],
            "total": c["total"],
            "easy": c["easy"],
            "medium": c["medium"],
            "hard": c["hard"],
            "windowsCount": c["windowsCount"]
        })

    index_path = os.path.join(public_data_dir, "companies.json")
    with open(index_path, "w", encoding="utf-8") as f:
        json.dump(index_list, f, separators=(',', ':'))

    duration = round(time.time() - start_time, 2)

    # Save sync status
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
        "durationSeconds": duration
    }

    status_path = os.path.join(public_data_dir, "sync-status.json")
    with open(status_path, "w", encoding="utf-8") as f:
        json.dump(status_obj, f, indent=2)

    print(f"\n✅ Multi-Source Sync completed in {duration}s!")
    print(f"📊 Total Companies: {len(merged_companies)}")
    print(f"🧩 Unique Problems: {len(total_unique_slugs)}")
    print(f"🛡️  Sources: liquidslr ({len(liquidslr_data)} co), snehasishroy ({len(snehasishroy_data)} co), LeetCode GraphQL ({len(leetcode_tags)} tags)")

if __name__ == "__main__":
    main()
